import { afterEach, expect, it, vi } from 'vitest';
import { appOrigin, venueUrl } from '../app-url';
import { validateDomain } from '../domains';

afterEach(() => vi.unstubAllEnvs());

it('uses the new canonical domain when no public origin is configured', () => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', '');
  expect(venueUrl('venue')).toBe('https://plebfm.lwn.lol/venue');
  expect(() => validateDomain('plebfm.lwn.lol')).toThrow();
  expect(() => validateDomain('venue.plebfm.lwn.lol')).toThrow();
  expect(validateDomain('other.lwn.lol')).toBe('other.lwn.lol');
});

it('keeps venue links on the configured origin and encodes the venue path', () => {
  vi.stubEnv('NEXT_PUBLIC_BASE_URL', 'https://music.example.com/');
  expect(appOrigin()).toBe('https://music.example.com');
  expect(venueUrl('venue?redirect=elsewhere')).toBe(
    'https://music.example.com/venue%3Fredirect%3Delsewhere',
  );
  expect(() => validateDomain('music.example.com')).toThrow();
  expect(() => validateDomain('venue.music.example.com')).toThrow();
  expect(validateDomain('other.example.com')).toBe('other.example.com');
});
