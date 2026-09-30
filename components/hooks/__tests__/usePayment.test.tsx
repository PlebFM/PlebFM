// @vitest-environment jsdom
import { act, render, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_CONSECUTIVE_FAILURES } from '../../../lib/payments/polling';
import { Song } from '../../../models/Song';
import { usePayment } from '../usePayment';

vi.mock('next/navigation', () => ({ usePathname: () => '/atl' }));
vi.mock('../../../utils/profile', () => ({
  getUserProfileFromLocal: () => ({ userId: 'user_1' }),
}));

const song = { id: 'song_1', name: 'Test Song' } as unknown as Song;

const MINTED = {
  payment_request: 'lnbc500n1first',
  payment_hash: 'signed_ref_first',
  status_ref: 'signed_ref_first',
};
const REMINTED = {
  payment_request: 'lnbc500n1second',
  payment_hash: 'signed_ref_second',
  status_ref: 'signed_ref_second',
};

type Api = ReturnType<typeof usePayment>;

/** Renders the hook and exposes its latest return value. */
const renderPayment = (onPaid = vi.fn()) => {
  const ref: { current: Api | null } = { current: null };
  const Probe = () => {
    const api = usePayment(song, 500, onPaid);
    useEffect(() => {
      ref.current = api;
    });
    ref.current = api;
    return null;
  };
  render(<Probe />);
  return { api: ref, onPaid };
};

const json = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as any);

let posts: number;
let gets: string[];
let fetchMock: ReturnType<typeof vi.fn>;

/**
 * Installs a fetch stub. `getResponses` is consumed one per status poll; the
 * final entry repeats once exhausted.
 */
const installFetch = (
  getResponses: Array<() => any>,
  postResponses: Array<() => any> = [() => json(200, MINTED)],
) => {
  posts = 0;
  gets = [];
  let getIndex = 0;
  fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (init?.method === 'POST') {
      const responder =
        postResponses[Math.min(posts, postResponses.length - 1)];
      posts += 1;
      return responder();
    }
    gets.push(url);
    const responder = getResponses[Math.min(getIndex, getResponses.length - 1)];
    getIndex += 1;
    return responder();
  });
  vi.stubGlobal('fetch', fetchMock);
};

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** Runs the poll loop forward by `count` intervals. */
const advancePolls = async (count: number) => {
  for (let i = 0; i < count; i += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
  }
};

describe('usePayment', () => {
  it('mints an invoice and reports settlement', async () => {
    installFetch([
      () => json(200, { settled: false }),
      () => json(201, { settled: true }),
    ]);
    const { api, onPaid } = renderPayment();

    await waitFor(() =>
      expect(api.current?.bolt11.paymentRequest).toBe('lnbc500n1first'),
    );
    await advancePolls(2);
    await waitFor(() => expect(onPaid).toHaveBeenCalled());
  });

  it('stops polling a terminal (expired) invoice and offers recovery', async () => {
    installFetch([
      () => json(200, { settled: false, terminal: true, reason: 'expired' }),
    ]);
    const { api } = renderPayment();

    await waitFor(() =>
      expect(api.current?.paymentFailure?.reason).toBe('expired'),
    );
    const before = gets.length;
    await advancePolls(3);
    expect(gets.length).toBe(before); // no further polling
  });

  describe('recovery after the server was unreachable (round 3, finding 1)', () => {
    const unavailable = async () => {
      installFetch([() => json(503, { settled: false, retryable: true })]);
      const { api, onPaid } = renderPayment();
      await waitFor(() =>
        expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
      );
      // Burn through the failure budget.
      await advancePolls(MAX_CONSECUTIVE_FAILURES + 2);
      await waitFor(() =>
        expect(api.current?.paymentFailure?.reason).toBe('unavailable'),
      );
      return { api, onPaid };
    };

    it('does NOT mint a second invoice — that would invite a double payment', async () => {
      const { api } = await unavailable();
      expect(posts).toBe(1);

      // Server recovers, and the original invoice turns out to be paid.
      fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          posts += 1;
          return json(200, REMINTED);
        }
        gets.push(url);
        return json(201, { settled: true });
      });

      await act(async () => {
        api.current?.retry();
      });

      expect(posts).toBe(1); // still no second invoice
      expect(api.current?.bolt11.paymentRequest).toBe('lnbc500n1first');
    });

    it('resumes polling the original reference and settles it', async () => {
      const { api, onPaid } = await unavailable();

      fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          posts += 1;
          return json(200, REMINTED);
        }
        gets.push(url);
        return json(201, { settled: true });
      });

      await act(async () => {
        api.current?.retry();
      });
      await waitFor(() => expect(onPaid).toHaveBeenCalled());

      expect(posts).toBe(1);
      // Every status request, including after recovery, used the first invoice.
      expect(gets.every(url => url.includes('signed_ref_first'))).toBe(true);
      expect(gets.some(url => url.includes('signed_ref_second'))).toBe(false);
    });

    it('clears the error so the payer sees the original QR again', async () => {
      const { api } = await unavailable();
      installFetch([() => json(200, { settled: false })]);
      await act(async () => {
        api.current?.retry();
      });
      expect(api.current?.paymentFailure).toBeNull();
      expect(api.current?.bolt11.paymentRequest).toBe('lnbc500n1first');
    });
  });

  describe('operational 4xx from route middleware (round 4, finding 1)', () => {
    // `withJukebox` answers 400 in plain text when it cannot refresh a Spotify
    // token. That says nothing about the invoice, which may already be paid.
    const wrapper400 = () =>
      ({
        ok: false,
        status: 400,
        json: async () => {
          throw new Error('withJukebox - could not fetch accessToken');
        },
      } as any);

    it('does not treat a bare 400 as an invalid invoice', async () => {
      installFetch([wrapper400]);
      const { api } = renderPayment();
      await waitFor(() =>
        expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
      );
      await advancePolls(MAX_CONSECUTIVE_FAILURES + 2);

      await waitFor(() => expect(api.current?.paymentFailure).not.toBeNull());
      // 'invalid' would remint; 'unavailable' resumes.
      expect(api.current?.paymentFailure?.reason).toBe('unavailable');
    });

    it('recovers without a second POST and keeps the original reference', async () => {
      installFetch([wrapper400]);
      const { api, onPaid } = renderPayment();
      await waitFor(() =>
        expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
      );
      await advancePolls(MAX_CONSECUTIVE_FAILURES + 2);
      await waitFor(() =>
        expect(api.current?.paymentFailure?.reason).toBe('unavailable'),
      );
      expect(posts).toBe(1);

      // Spotify recovers; the invoice the payer already paid settles.
      fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
        if (init?.method === 'POST') {
          posts += 1;
          return json(200, REMINTED);
        }
        gets.push(url);
        return json(201, { settled: true });
      });

      await act(async () => {
        api.current?.retry();
      });
      await waitFor(() => expect(onPaid).toHaveBeenCalled());

      expect(posts).toBe(1);
      expect(gets.every(url => url.includes('signed_ref_first'))).toBe(true);
      expect(gets.some(url => url.includes('signed_ref_second'))).toBe(false);
    });

    it('still retires the invoice on an explicit terminal 400', async () => {
      // Our own contract marks a rejected reference terminal, unlike middleware.
      installFetch([
        () => json(400, { settled: false, terminal: true, reason: 'invalid' }),
      ]);
      const { api } = renderPayment();
      await waitFor(() =>
        expect(api.current?.paymentFailure?.reason).toBe('invalid'),
      );
      const before = gets.length;
      await advancePolls(3);
      expect(gets.length).toBe(before); // stopped immediately, no budget burn
    });
  });

  it('bounds a malformed 200 instead of polling forever (PE-1)', async () => {
    // 200 with no `settled` verdict: previously reset the budget every time.
    installFetch([() => json(200, { unexpected: 'shape' })]);
    const { api } = renderPayment();
    await waitFor(() =>
      expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
    );
    await advancePolls(MAX_CONSECUTIVE_FAILURES + 3);
    await waitFor(() =>
      expect(api.current?.paymentFailure?.reason).toBe('unavailable'),
    );
    expect(gets.length).toBe(MAX_CONSECUTIVE_FAILURES);
  });

  describe('recovery from a terminal invoice', () => {
    it('mints a replacement when the invoice expired', async () => {
      installFetch(
        [
          () =>
            json(200, { settled: false, terminal: true, reason: 'expired' }),
        ],
        [() => json(200, MINTED), () => json(200, REMINTED)],
      );
      const { api } = renderPayment();
      await waitFor(() =>
        expect(api.current?.paymentFailure?.reason).toBe('expired'),
      );
      expect(posts).toBe(1);

      await act(async () => {
        api.current?.retry();
      });

      await waitFor(() => expect(posts).toBe(2));
      await waitFor(() =>
        expect(api.current?.bolt11.paymentRequest).toBe('lnbc500n1second'),
      );
    });

    it('mints a replacement when minting itself failed', async () => {
      installFetch(
        [() => json(200, { settled: false })],
        [() => json(500, { error: 'boom' }), () => json(200, REMINTED)],
      );
      const { api } = renderPayment();
      await waitFor(() =>
        expect(api.current?.paymentFailure?.reason).toBe('mint'),
      );

      await act(async () => {
        api.current?.retry();
      });
      await waitFor(() => expect(posts).toBe(2));
    });
  });

  it('gives up on the fifth consecutive failure, not the sixth', async () => {
    installFetch([() => json(500, { error: 'down' })]);
    const { api } = renderPayment();
    await waitFor(() =>
      expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
    );

    // Let the loop run well past the cap, then count what it actually sent.
    await advancePolls(MAX_CONSECUTIVE_FAILURES + 3);
    await waitFor(() =>
      expect(api.current?.paymentFailure?.reason).toBe('unavailable'),
    );
    expect(gets.length).toBe(MAX_CONSECUTIVE_FAILURES);
  });

  it('survives a non-JSON error body without silently killing the loop', async () => {
    installFetch([
      () =>
        ({
          ok: false,
          status: 502,
          json: async () => {
            throw new Error('not json');
          },
        } as any),
      () => json(201, { settled: true }),
    ]);
    const { api, onPaid } = renderPayment();
    await waitFor(() =>
      expect(api.current?.bolt11.statusRef).toBe('signed_ref_first'),
    );
    await advancePolls(2);
    await waitFor(() => expect(onPaid).toHaveBeenCalled());
  });
});
