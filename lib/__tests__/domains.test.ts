import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  txt: vi.fn(),
  find: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('dns/promises', () => ({ resolveTxt: mocks.txt }));
vi.mock('../../models/CustomDomain', () => ({
  default: { findOne: mocks.find, deleteOne: mocks.remove },
}));
import { domainChallenge, verifyDomain, removeDomain } from '../domains';
let record: any;
beforeEach(() => {
  vi.clearAllMocks();
  process.env.NEXTAUTH_SECRET = 'test-secret';
  process.env.VERCEL_DOMAIN_TOKEN = 'test-token';
  process.env.VERCEL_PROJECT_ID = 'test-project';
  record = {
    _id: 'domain',
    domain: 'venue.example',
    hostId: 'host',
    save: vi.fn(),
  };
  mocks.find.mockResolvedValue(record);
  mocks.txt.mockResolvedValue([[domainChallenge('host', 'venue.example')]]);
});
it('never contacts the domain provider before proving DNS ownership', async () => {
  mocks.txt.mockResolvedValue([['wrong']]);
  const request = vi.fn();
  vi.stubGlobal('fetch', request);
  await expect(verifyDomain('host')).rejects.toMatchObject({ status: 409 });
  expect(request).not.toHaveBeenCalled();
});
it('attaches once and preserves the attached state if DNS configuration lookup fails', async () => {
  const request = vi
    .fn()
    .mockResolvedValueOnce(new Response('{}', { status: 404 }))
    .mockResolvedValueOnce(Response.json({ verified: true }))
    .mockResolvedValueOnce(new Response('{}', { status: 503 }));
  vi.stubGlobal('fetch', request);
  await expect(verifyDomain('host')).rejects.toMatchObject({ status: 502 });
  expect(record.verification.attached).toBe(true);
  expect(record.save).toHaveBeenCalledOnce();
  request
    .mockReset()
    .mockResolvedValueOnce(Response.json({ verified: true }))
    .mockResolvedValueOnce(
      Response.json({
        misconfigured: false,
        recommendedCNAME: ['cname.vercel-dns.com'],
      }),
    );
  await verifyDomain('host');
  expect(record.verified).toBe(true);
  expect(
    request.mock.calls.every(([, options]) => options.method === 'GET'),
  ).toBe(true);
});
it('does not claim verification while Vercel DNS is misconfigured', async () => {
  record.verification = { attached: true };
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(Response.json({ verified: true }))
      .mockResolvedValueOnce(Response.json({ misconfigured: true })),
  );
  await verifyDomain('host');
  expect(record.verified).toBe(false);
});
it('can finish removing a domain already detached at Vercel', async () => {
  record.verification = { attached: true };
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue(new Response('{}', { status: 404 })),
  );
  await removeDomain('host');
  expect(mocks.remove).toHaveBeenCalledWith({ _id: 'domain' });
});
