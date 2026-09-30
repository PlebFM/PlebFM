import { describe, expect, it } from 'vitest';
import { ProviderTimeoutError } from '../deadline';
import { decidePollOutcome } from '../polling';
import { InvalidInvoiceRefError, PaymentHashMismatchError } from '../resolve';
import {
  createInvoiceErrorResponse,
  invoiceErrorResponse,
  unsettledResponse,
} from '../responses';

/** What the browser would do with each answer, so the wire contract and the
 *  poll rule are asserted together rather than drifting apart. */
const outcomeOf = ({
  httpStatus,
  body,
}: {
  httpStatus: number;
  body: unknown;
}) => decidePollOutcome(httpStatus, body as never, 0);

describe('unsettledResponse', () => {
  it('keeps an ordinary unpaid invoice pollable', () => {
    const response = unsettledResponse(false);
    expect(response).toEqual({ httpStatus: 200, body: { settled: false } });
    expect(outcomeOf(response)).toEqual({ action: 'retry' });
  });

  it('marks an expired invoice terminal', () => {
    const response = unsettledResponse(true);
    expect(response.httpStatus).toBe(200);
    expect(response.body.settled).toBe(false);
    expect(response.body.terminal).toBe(true);
    expect(outcomeOf(response)).toEqual({ action: 'stop', reason: 'expired' });
  });
});

describe('invoiceErrorResponse', () => {
  it('rejects an unverifiable reference as terminal, not retryable', () => {
    const response = invoiceErrorResponse(new InvalidInvoiceRefError());
    expect(response.httpStatus).toBe(400);
    expect(response.body.terminal).toBe(true);
    expect(response.body.retryable).toBeUndefined();
    expect(outcomeOf(response)).toEqual({ action: 'stop', reason: 'invalid' });
  });

  it('treats a provider timeout as retryable, not terminal', () => {
    const response = invoiceErrorResponse(
      new ProviderTimeoutError('getCheckout', 8_000),
    );
    expect(response.httpStatus).toBe(504);
    expect(response.body.retryable).toBe(true);
    expect(response.body.terminal).toBeUndefined();
    expect(outcomeOf(response)).toEqual({ action: 'retry' });
  });

  it('treats an unrecognised failure as retryable', () => {
    const response = invoiceErrorResponse(new Error('mongo is having a day'));
    expect(response.httpStatus).toBe(500);
    expect(outcomeOf(response)).toEqual({ action: 'retry' });
  });

  it('does not hand the payment hashes back to whoever forged the token', () => {
    const response = invoiceErrorResponse(
      new PaymentHashMismatchError('a'.repeat(64), 'b'.repeat(64)),
    );
    expect(response.httpStatus).toBe(409);
    expect(response.body.terminal).toBe(true);
    expect(JSON.stringify(response.body)).not.toContain('a'.repeat(64));
    expect(JSON.stringify(response.body)).not.toContain('b'.repeat(64));
    expect(outcomeOf(response)).toEqual({ action: 'stop', reason: 'invalid' });
  });

  it('never reports an unpaid invoice as settled, whatever went wrong', () => {
    for (const error of [
      new InvalidInvoiceRefError(),
      new PaymentHashMismatchError('a', 'b'),
      new ProviderTimeoutError('getCheckout', 1),
      new Error('unknown'),
    ]) {
      expect(invoiceErrorResponse(error).body.settled).toBe(false);
    }
  });
});

describe('createInvoiceErrorResponse', () => {
  it('reports a stalled mint as a gateway timeout', () => {
    const response = createInvoiceErrorResponse(
      new ProviderTimeoutError('createCheckout', 8_000),
    );
    expect(response.httpStatus).toBe(504);
    expect(response.body.retryable).toBe(true);
  });

  it('reports any other mint failure as a server error', () => {
    expect(createInvoiceErrorResponse(new Error('nope')).httpStatus).toBe(500);
  });
});
