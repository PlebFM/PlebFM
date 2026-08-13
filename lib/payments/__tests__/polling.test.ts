import { describe, expect, it } from 'vitest';
import {
  MAX_CONSECUTIVE_FAILURES,
  NETWORK_FAILURE,
  decidePollOutcome,
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

    it('stops on any 4xx, even one with no body to read', () => {
      expect(decidePollOutcome(404, null, 0)).toEqual({
        action: 'stop',
        reason: 'invalid',
      });
    });

    it('defaults the reason when a terminal answer omits it', () => {
      expect(
        decidePollOutcome(200, { settled: false, terminal: true }, 0),
      ).toEqual({ action: 'stop', reason: 'invalid' });
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
