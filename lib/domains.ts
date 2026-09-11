import { createHmac } from 'crypto';
import { resolveTxt } from 'dns/promises';
import Domains from '../models/CustomDomain';
import { HttpError } from './http';
export function validateDomain(domain: unknown): string {
  if (
    typeof domain !== 'string' ||
    domain.length > 253 ||
    !/^([a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain) ||
    domain.endsWith('.vercel.app') ||
    domain === 'pleb.fm' ||
    domain.endsWith('.pleb.fm')
  )
    throw new HttpError(
      400,
      'Enter a domain you own, without https:// or a path',
    );
  return domain;
}
export function domainChallenge(hostId: string, domain: string) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET required');
  return createHmac('sha256', process.env.NEXTAUTH_SECRET)
    .update(`domain:${hostId}:${domain}`)
    .digest('hex');
}
async function vercel(path: string, method = 'GET', body?: unknown) {
  if (!process.env.VERCEL_DOMAIN_TOKEN || !process.env.VERCEL_PROJECT_ID)
    throw new HttpError(503, 'Custom domain provisioning is not configured');
  const query = process.env.VERCEL_TEAM_ID
    ? `?teamId=${encodeURIComponent(process.env.VERCEL_TEAM_ID)}`
    : '';
  const res = await fetch(`https://api.vercel.com${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.VERCEL_DOMAIN_TOKEN}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(8000),
  });
  const data = await res.json();
  if (!res.ok)
    throw new HttpError(
      res.status === 404 ? 404 : 502,
      'Domain provider could not complete the request',
    );
  return data;
}
export async function verifyDomain(hostId: string) {
  const record = await Domains.findOne({ hostId });
  if (!record) throw new HttpError(404, 'Save a domain first');
  const txt = await resolveTxt(`_plebfm.${record.domain}`).catch(() => []);
  if (
    !txt.some(
      parts => parts.join('') === domainChallenge(hostId, record.domain),
    )
  )
    throw new HttpError(
      409,
      'Add the TXT record below, then retry verification',
    );
  const base = `/v9/projects/${encodeURIComponent(
    process.env.VERCEL_PROJECT_ID ?? '',
  )}/domains`;
  let remote: any;
  // Repeated verification must not repeatedly add an already attached domain.
  if (record.verification?.attached)
    remote = await vercel(`${base}/${record.domain}`);
  else {
    try {
      remote = await vercel(`${base}/${record.domain}`);
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
      remote = await vercel(base, 'POST', { name: record.domain });
    }
    record.verification = {
      attached: true,
      records: remote.verification ?? [],
    };
    await record.save();
  }
  if (!remote.verified) {
    try {
      remote = await vercel(`${base}/${record.domain}/verify`, 'POST');
    } catch {
      /* Return provider's DNS challenges for the host to complete. */
    }
  }
  const dns = await vercel(`/v6/domains/${record.domain}/config`);
  record.verified = !!remote.verified && !dns.misconfigured;
  record.verification = { attached: true, records: remote.verification ?? [] };
  record.dns = {
    a: dns.recommendedIPv4 ?? [],
    cname: dns.recommendedCNAME ?? [],
  };
  await record.save();
  return record;
}
export async function removeDomain(hostId: string) {
  const record = await Domains.findOne({ hostId });
  if (!record) return;
  if (record.verification?.attached)
    try {
      await vercel(
        `/v9/projects/${encodeURIComponent(
          process.env.VERCEL_PROJECT_ID ?? '',
        )}/domains/${record.domain}`,
        'DELETE',
      );
    } catch (error) {
      if (!(error instanceof HttpError) || error.status !== 404) throw error;
    }
  await Domains.deleteOne({ _id: record._id });
}
