import { timingSafeEqual } from 'node:crypto';

export default async function reconcile(request, context) {
  const secret = process.env.CRON_SECRET;
  const expected = Buffer.from(`Bearer ${secret || ''}`);
  const provided = Buffer.from(request.headers.get('authorization') || '');
  if (
    !secret ||
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  )
    return new Response(null, { status: 401 });
  if (context.deploy.context !== 'production' || !context.deploy.published)
    return new Response(null, { status: 403 });
  const url = new URL('/api/jobs/reconcile', context.site.url);
  if (url.protocol !== 'https:') throw Error('HTTPS production URL required');
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${secret}` },
    redirect: 'error',
    signal: AbortSignal.timeout(65000),
  });
  // Throw on a failing batch so Netlify's background retry/logging can act.
  // Never log the response body, which may include provider or user details.
  if (!response.ok) throw Error(`Reconciliation failed (${response.status})`);
}
export const config = { background: true, method: 'POST' };
