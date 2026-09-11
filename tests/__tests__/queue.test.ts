import { beforeEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  session: vi.fn(),
  host: vi.fn(),
  play: vi.fn(),
  queue: vi.fn(),
  start: vi.fn(),
  getQueue: vi.fn(),
}));
vi.mock('../../middleware/mongodb', () => ({ default: (h: any) => h }));
vi.mock('../../lib/auth', () => ({ requireHostSession: mocks.session }));
vi.mock('../../models/Host', () => ({ default: { findOne: mocks.host } }));
vi.mock('../../models/Play', () => ({ default: { findOne: mocks.play } }));
vi.mock('../../lib/queue', () => ({ getQueue: mocks.getQueue }));
vi.mock('../../lib/spotify', () => ({
  getSpotifyQueue: mocks.queue,
  startSpotifyQueue: mocks.start,
}));
import handler from '../../pages/api/leaderboard/queue';
const response = () => ({
  json: vi.fn(),
  setHeader: vi.fn(),
  status: vi.fn().mockReturnThis(),
});
beforeEach(() => {
  vi.clearAllMocks();
  mocks.host.mockResolvedValue({ hostId: 'owner' });
  mocks.session.mockResolvedValue({
    user: { id: 'owner' },
    accessToken: 'owner-token',
  });
  mocks.play.mockResolvedValue(null);
  mocks.queue.mockResolvedValue({ currently_playing: null });
});
it('starts an empty jukebox without dereferencing a missing playing song', async () => {
  await handler(
    {
      method: 'PUT',
      body: {
        shortName: 'venue',
        deviceId: 'device',
        accessToken: 'attacker-token',
      },
    } as any,
    response() as any,
  );
  expect(mocks.start).toHaveBeenCalledWith(
    expect.stringMatching(/^spotify:track:/),
    'device',
    'owner-token',
  );
});
it('forbids another host from starting a queue', async () => {
  mocks.session.mockResolvedValue({ user: { id: 'other' } });
  await expect(
    handler(
      { method: 'PUT', body: { shortName: 'venue' } } as any,
      response() as any,
    ),
  ).rejects.toMatchObject({ status: 403 });
  expect(mocks.queue).not.toHaveBeenCalled();
});
it('does not require Spotify to read the public queue', async () => {
  mocks.getQueue.mockResolvedValue([]);
  await handler(
    { method: 'GET', query: { shortName: 'venue' } } as any,
    response() as any,
  );
  expect(mocks.getQueue).toHaveBeenCalled();
  expect(mocks.queue).not.toHaveBeenCalled();
  expect(mocks.session).not.toHaveBeenCalled();
});
