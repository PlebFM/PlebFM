/**
 * Application-level deadline for provider calls.
 *
 * `@moneydevkit/core@0.22.0` exposes `createCheckout(params)` and
 * `getCheckout(id)` with no options argument, so there is no transport timeout
 * and no AbortSignal to hand down. A stalled mdk.com therefore holds the
 * serverless invocation open until the platform kills it, which surfaces to the
 * browser as a hung request rather than a retryable failure.
 *
 * This does not cancel the upstream call — nothing here can. It bounds how long
 * *our* request waits before answering, which is the part that matters: the
 * poller gets a fast, explicit "try again" instead of a socket held to the
 * platform limit.
 */

export class ProviderTimeoutError extends Error {
  constructor(readonly operation: string, readonly timeoutMs: number) {
    super(`${operation} exceeded ${timeoutMs}ms`);
    this.name = 'ProviderTimeoutError';
  }
}

/**
 * Default deadline for a single provider call.
 *
 * Sits under the shortest platform function limit this app is likely to meet
 * (Vercel's 10s default for the Node runtime) with room left to serialise a
 * response, so the timeout is ours and not the platform's.
 */
export const DEFAULT_PROVIDER_TIMEOUT_MS = 8_000;

export const providerTimeoutMs = (): number => {
  const raw = process.env.MDK_REQUEST_TIMEOUT_MS;
  if (!raw) return DEFAULT_PROVIDER_TIMEOUT_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_PROVIDER_TIMEOUT_MS;
};

/**
 * Run `operation`, rejecting with `ProviderTimeoutError` once `timeoutMs` passes.
 *
 * The timer is always cleared, so a fast call never leaves the event loop with
 * work pending; and the operation's own rejection is always observed, so losing
 * the race cannot produce an unhandled rejection later.
 */
export const withDeadline = async <T>(
  label: string,
  operation: () => Promise<T>,
  timeoutMs: number = providerTimeoutMs(),
): Promise<T> => {
  // `Promise.race` subscribes to every input, so a provider rejection arriving
  // after the deadline is already observed and cannot surface as an unhandled
  // rejection. Any rewrite of this function has to preserve that — see the test.
  const running = operation();

  let timer: ReturnType<typeof setTimeout> | undefined;
  const expiry = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new ProviderTimeoutError(label, timeoutMs)),
      timeoutMs,
    );
  });

  try {
    return await Promise.race([running, expiry]);
  } finally {
    clearTimeout(timer);
  }
};
