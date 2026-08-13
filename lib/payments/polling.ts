/**
 * The `/api/invoice` status contract, and the rule the browser polls by.
 *
 * Deliberately dependency-free so the checkout hook can import it without
 * pulling the provider implementations — and therefore the Money Dev Kit SDK
 * and node crypto — into the client bundle.
 *
 * The poller used to treat every non-`settled` answer as "not yet" and schedule
 * another request in two seconds, forever. An expired invoice or a rejected
 * reference is never going to become paid, so that is an infinite loop against
 * a dead checkout for as long as the tab stays open. `terminal` says so
 * explicitly instead of leaving the client to infer it.
 */

export type InvoiceStatusReason = 'expired' | 'invalid';

export type InvoiceStatusBody = {
  /** Present on every non-error answer. Old clients read only this. */
  settled?: boolean;
  /** This invoice will never settle. Stop polling. */
  terminal?: boolean;
  /** Why it is terminal, for the message shown to the payer. */
  reason?: InvoiceStatusReason;
  /** A transient server-side failure; polling may continue. */
  retryable?: boolean;
  error?: string;
};

export const POLL_INTERVAL_MS = 2_000;

/**
 * How many consecutive transient failures to absorb before giving up.
 *
 * At `POLL_INTERVAL_MS` this is roughly ten seconds of provider trouble, which
 * outlasts a blip without leaving someone who has already paid staring at a
 * spinner indefinitely.
 */
export const MAX_CONSECUTIVE_FAILURES = 5;

/** `httpStatus` to report when the request never produced a response at all. */
export const NETWORK_FAILURE = 0;

export type PollOutcome =
  | { action: 'paid' }
  | { action: 'retry' }
  | { action: 'stop'; reason: InvoiceStatusReason | 'unavailable' };

/** Why the payment flow stopped, as shown to the payer. */
export type PaymentFailureReason = InvoiceStatusReason | 'unavailable' | 'mint';

/**
 * Whether an answer counts against the consecutive-failure budget.
 *
 * One definition, used both to decide the outcome and to advance the counter, so
 * the two cannot drift apart on what "a failure" means.
 */
export const isTransientFailure = (httpStatus: number): boolean =>
  httpStatus === NETWORK_FAILURE || httpStatus >= 500;

export type RecoveryAction =
  /** Keep the invoice and start polling it again. */
  | 'resume'
  /** The invoice is dead or was never created; mint a replacement. */
  | 'remint';

/**
 * What the payer's retry action should actually do.
 *
 * This distinction is a payment-safety property, not a nicety. `unavailable`
 * means the *server* was unreachable — the invoice is still live and may already
 * have been paid, so minting a replacement can take a second payment for a bid
 * that was already funded, and abandons the first one. Only mint again when the
 * invoice is known dead (`expired`), known rejected (`invalid`), or was never
 * successfully created (`mint`).
 */
export const decideRecovery = (reason: PaymentFailureReason): RecoveryAction =>
  reason === 'unavailable' ? 'resume' : 'remint';

/**
 * Decide what the poller does with one `/api/invoice` answer.
 *
 * Split out of the hook so the decision is testable without a DOM: the bug
 * being fixed here is entirely in this logic, not in the React around it.
 *
 * `consecutiveFailures` must *include* the answer being judged — pass the count
 * after this response, not before it, or the budget is spent one request late.
 */
export const decidePollOutcome = (
  httpStatus: number,
  body: InvoiceStatusBody | null,
  consecutiveFailures: number,
): PollOutcome => {
  // Settled wins outright: a 2xx that says paid is the answer regardless of
  // anything else in the body.
  if (body?.settled === true) return { action: 'paid' };

  if (body?.terminal === true) {
    return { action: 'stop', reason: body.reason ?? 'invalid' };
  }

  // A rejected reference is the client's own problem and will be rejected
  // identically every time. Retrying it is pure noise.
  if (httpStatus >= 400 && httpStatus < 500) {
    return { action: 'stop', reason: 'invalid' };
  }

  // Server fault or no response at all: transient until it has happened enough
  // times in a row to stop being credible.
  if (isTransientFailure(httpStatus)) {
    return consecutiveFailures >= MAX_CONSECUTIVE_FAILURES
      ? { action: 'stop', reason: 'unavailable' }
      : { action: 'retry' };
  }

  return { action: 'retry' };
};
