import { beforeEach, expect, it, vi } from 'vitest';
const { find, update, session } = vi.hoisted(() => ({
  find: vi.fn(),
  update: vi.fn(),
  session: vi.fn(),
}));
vi.mock('../../middleware/mongodb', () => ({ default: (h: any) => h }));
vi.mock('../../lib/auth', () => ({
  requireHostSession: session,
  assertSameOrigin: vi.fn(),
}));
vi.mock('../../models/Host', () => ({
  default: { find, findOneAndUpdate: update },
}));
import handler from '../../pages/api/hosts';
const res = () => ({
  statusCode: 200,
  body: null as any,
  setHeader: vi.fn(),
  status(n: number) {
    this.statusCode = n;
    return this;
  },
  json(b: any) {
    this.body = b;
    return this;
  },
  send(b: any) {
    this.body = b;
    return this;
  },
});
beforeEach(() => {
  vi.clearAllMocks();
  find.mockReturnValue({
    select: () => ({
      lean: async () => [
        {
          hostId: 'owner',
          hostName: 'Venue',
          shortName: 'venue',
          spotifyRefreshToken: 'SECRET',
        },
      ],
    }),
  });
  session.mockResolvedValue(null);
});
it('never serializes a refresh token in public data', async () => {
  const r = res();
  await handler({ method: 'GET', query: {} } as any, r as any);
  expect(JSON.stringify(r.body)).not.toContain('SECRET');
});
it('refuses anonymous mutation', async () => {
  const r = res();
  await handler(
    {
      method: 'PATCH',
      body: { spotifyId: 'victim', hostName: 'Stolen' },
    } as any,
    r as any,
  );
  expect(update).not.toHaveBeenCalled();
});
it('does not permit an authenticated user to select another owner', async () => {
  session.mockResolvedValue({ user: { id: 'owner' } });
  update.mockResolvedValue({
    hostId: 'owner',
    shortName: 'venue',
    hostName: 'Changed',
  });
  const r = res();
  await handler(
    {
      method: 'PATCH',
      body: { spotifyId: 'victim', hostName: 'Changed' },
    } as any,
    r as any,
  );
  expect(update.mock.calls[0]?.[0]).toEqual({
    hostId: 'owner',
    deletedAt: null,
  });
});
