import { afterEach, expect, it, vi } from 'vitest';
import { getLnbitsInvoice } from '../lnbits';
import { hostUpdates, publicHost } from '../public-host';
import { validateDomain } from '../domains';
afterEach(() => vi.unstubAllGlobals());
it('returns a controlled error for a non-JSON provider outage', async () => {
  process.env.LNBITS_URL = 'https://example.test';
  process.env.LNBITS_API_KEY = 'synthetic';
  const json = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: false, status: 404, json }),
  );
  await expect(getLnbitsInvoice('bid', 1)).rejects.toThrow('unavailable');
  expect(json).not.toHaveBeenCalled();
});
it('serializes a strict allowlist even when database credentials are loaded', () => {
  expect(
    publicHost({
      hostId: 'a',
      spotifyId: 'b',
      spotifyRefreshToken: 'secret',
      extra: 'secret',
    }),
  ).not.toHaveProperty('spotifyRefreshToken');
  expect(
    JSON.stringify(publicHost({ hostId: 'a', spotifyRefreshToken: 'secret' })),
  ).not.toContain('secret');
});
it('allows partial updates without erasing the other settings', () => {
  expect(
    hostUpdates({
      hostName: ' Updated ',
      spotifyId: 'victim',
      refreshToken: 'attack',
    }),
  ).toEqual({ hostName: 'Updated' });
  expect(() => hostUpdates({ shortName: 'api' })).toThrow();
  expect(() => hostUpdates({ accentColor: 'javascript:alert(1)' })).toThrow();
});
it('refuses domains outside the supported ownership flow', () => {
  for (const domain of [
    'https://example.com',
    'localhost',
    'pleb.fm',
    'test.pleb.fm',
    'test.vercel.app',
    '127.0.0.1',
    'example.com/path',
  ])
    expect(() => validateDomain(domain)).toThrow();
  expect(validateDomain('music.example.com')).toBe('music.example.com');
});
