import { describe, expect, it } from 'vitest';
import {
  MAX_CONSECUTIVE_FAILURES,
  NETWORK_FAILURE,
  decidePollOutcome,
  isTransientFailure,
} from '../polling';

describe('decidePollOutcome', () => {
  describe('terminal invoices stop the poller (PR #111 round 2, finding 1)', () => {
    it('stops on an expired invoice instead of polling a dead checkout', () => {
      expect(
        decidePollOutcome(
          200,
          { settled: false, terminal: true, reason: 'expired' },
          0,
        ),
      ).toEqual({ action: 'stop', reason: 'expired' });
    });

    it('stops on a rejected invoice reference', () => {
      expect(
        decidePollOutcome(
          400,
          { settled: false, terminal: true, reason: 'invalid' },
          0,
        ),
      ).toEqual({ action: 'stop', reason: 'invalid' });
    });

    it('defaults the reason when a terminal answer omits it', () => {
      expect(
        decidePollOutcome(200, { settled: false, terminal: true }, 0),
      ).toEqual({ action: 'stop', reason: 'invalid' });
    });
  });

  // This block replaces an earlier assertion that any 4xx meant `invalid`.
  // `/api/invoice` sits behind `withJukebox`, which returns a plain-text 400
  // when a Spotify token refresh fails — nothing to do with the invoice, which
  // may already be paid. `invalid` recovery mints a replacement, so inferring it
  // from a status code alone could ask a payer to pay twice.
  describe('an operational 4xx is not a dead invoice', () => {
    it('treats a bodyless 4xx as transient, not invalid', () => {
      expect(decidePollOutcome(400, null, 0)).toEqual({ action: 'retry' });
      expect(decidePollOutcome(404, null, MAX_CONSECUTIVE_FAILURES)).toEqual({
        action: 'stop',
        reason: 'unavailable',
      });
    });

    it('still retires an invoice on an explicitly terminal 4xx', () => {
      expect(
        decidePollOutcome(
          400,
          { settled: false, terminal: true, reason: 'invalid' },
          0,
        ),
      ).toEqual({ action: 'stop', reason: 'invalid' });
    });

    it('counts an operational 4xx against the budget', () => {
      expect(isTransientFailure(400, null)).toBe(true);
      expect(isTransientFailure(400, { settled: false, terminal: true })).toBe(
        false,
      );
    });
  });

  describe('malformed answers are bounded', () => {
    it('counts a 2xx with no settlement verdict', () => {
      expect(isTransientFailure(200, null)).toBe(true);
      expect(isTransientFailure(200, { unexpected: 'shape' } as never)).toBe(
        true,
      );
      expect(decidePollOutcome(200, null, MAX_CONSECUTIVE_FAILURES)).toEqual({
        action: 'stop',
        reason: 'unavailable',
      });
    });

    it('does not count a well-formed unpaid answer', () => {
      expect(isTransientFailure(200, { settled: false })).toBe(false);
    });
  });

  describe('transient failures', () => {
    it('retries a server error until the run of failures stops being credible', () => {
      expect(decidePollOutcome(500, { retryable: true }, 0)).toEqual({
        action: 'retry',
      });
      expect(
        decidePollOutcome(
          504,
          { retryable: true },
          MAX_CONSECUTIVE_FAILURES - 1,
        ),
      ).toEqual({ action: 'retry' });
      expect(
        decidePollOutcome(504, { retryable: true }, MAX_CONSECUTIVE_FAILURES),
      ).toEqual({ action: 'stop', reason: 'unavailable' });
    });

    it('treats a request that never landed the same way', () => {
      expect(decidePollOutcome(NETWORK_FAILURE, null, 0)).toEqual({
        action: 'retry',
      });
      expect(
        decidePollOutcome(NETWORK_FAILURE, null, MAX_CONSECUTIVE_FAILURES),
      ).toEqual({ action: 'stop', reason: 'unavailable' });
    });
  });

  describe('the ordinary path is unchanged', () => {
    it('keeps polling an unpaid invoice', () => {
      expect(decidePollOutcome(200, { settled: false }, 0)).toEqual({
        action: 'retry',
      });
    });

    it('reports a paid invoice', () => {
      expect(decidePollOutcome(201, { settled: true }, 0)).toEqual({
        action: 'paid',
      });
    });

    it('takes settled over everything else in the body', () => {
      // Belt and braces: settlement is the one answer that must never be lost
      // to a stop rule, however the rest of the body is shaped.
      expect(
        decidePollOutcome(201, { settled: true, terminal: true }, 99),
      ).toEqual({ action: 'paid' });
    });
  });
});
