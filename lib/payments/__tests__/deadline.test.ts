import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_PROVIDER_TIMEOUT_MS,
  ProviderTimeoutError,
  providerTimeoutMs,
  withDeadline,
} from '../deadline';

describe('withDeadline', () => {
  afterEach(() => {
    vi.useRealTimers();
    delete process.env.MDK_REQUEST_TIMEOUT_MS;
  });

  it('returns the result when the call finishes in time', async () => {
    vi.useFakeTimers();
    await expect(
      withDeadline('fast', async () => 'checkout_123', 1_000),
    ).resolves.toBe('checkout_123');
    // A pending timer would keep a serverless invocation alive past its answer.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('rejects with ProviderTimeoutError when the call never settles', async () => {
    vi.useFakeTimers();
    const pending = withDeadline(
      'getCheckout',
      () => new Promise<never>(() => {}),
      1_000,
    );
    const rejects =
      expect(pending).rejects.toBeInstanceOf(ProviderTimeoutError);
    await vi.advanceTimersByTimeAsync(1_000);
    await rejects;
    expect(vi.getTimerCount()).toBe(0);
  });

  it('names the operation and the deadline it blew', async () => {
    vi.useFakeTimers();
    const pending = withDeadline(
      'createCheckout',
      () => new Promise<never>(() => {}),
      2_500,
    );
    const rejects = expect(pending).rejects.toThrow(
      'createCheckout exceeded 2500ms',
    );
    await vi.advanceTimersByTimeAsync(2_500);
    await rejects;
  });

  it('propagates a provider error that beats the deadline', async () => {
    vi.useFakeTimers();
    await expect(
      withDeadline(
        'getCheckout',
        async () => {
          throw new Error('mdk.com said no');
        },
        1_000,
      ),
    ).rejects.toThrow('mdk.com said no');
  });

  // Losing the race must not turn the SDK's own later failure into an
  // unhandled rejection, which in a serverless runtime can take the process
  // down and lose unrelated in-flight requests. `Promise.race` gives this for
  // free today; this pins it against a rewrite that hand-rolls the race.
  it('observes a provider rejection that arrives after the deadline', async () => {
    const unhandled: unknown[] = [];
    const listener = (reason: unknown) => unhandled.push(reason);
    process.on('unhandledRejection', listener);
    try {
      let rejectLate!: (e: Error) => void;
      const pending = withDeadline(
        'getCheckout',
        () =>
          new Promise<never>((_, reject) => {
            rejectLate = reject;
          }),
        5,
      );
      await expect(pending).rejects.toBeInstanceOf(ProviderTimeoutError);

      rejectLate(new Error('upstream failed long after we gave up'));
      await new Promise(resolve => setTimeout(resolve, 25));

      expect(unhandled).toEqual([]);
    } finally {
      process.off('unhandledRejection', listener);
    }
  });
});

describe('providerTimeoutMs', () => {
  afterEach(() => {
    delete process.env.MDK_REQUEST_TIMEOUT_MS;
  });

  it('defaults when unset', () => {
    expect(providerTimeoutMs()).toBe(DEFAULT_PROVIDER_TIMEOUT_MS);
  });

  it('honours an override', () => {
    process.env.MDK_REQUEST_TIMEOUT_MS = '1500';
    expect(providerTimeoutMs()).toBe(1_500);
  });

  it('falls back rather than disabling the deadline on junk', () => {
    for (const value of ['', 'soon', '0', '-1', 'NaN']) {
      process.env.MDK_REQUEST_TIMEOUT_MS = value;
      expect(providerTimeoutMs()).toBe(DEFAULT_PROVIDER_TIMEOUT_MS);
    }
  });
});
