import { ProviderTimeoutError } from './deadline';
import { InvoiceStatusBody } from './polling';
import { InvalidInvoiceRefError, PaymentHashMismatchError } from './resolve';

/**
 * Maps settlement outcomes and failures onto the `/api/invoice` wire contract.
 *
 * Kept out of the route handler so the contract the browser polls against can
 * be tested directly, rather than only through a route that also needs Mongo,
 * the jukebox middleware and a live provider.
 */
export type InvoiceStatusResponse = {
  httpStatus: number;
  body: InvoiceStatusBody;
};

/** Answer for an invoice that has not been paid. */
export const unsettledResponse = (expired: boolean): InvoiceStatusResponse =>
  expired
    ? {
        httpStatus: 200,
        body: {
          settled: false,
          terminal: true,
          reason: 'expired',
          error: 'This invoice expired before it was paid',
        },
      }
    : { httpStatus: 200, body: { settled: false } };

/**
 * Answer for a failed status lookup.
 *
 * The distinction that matters to the poller is terminal versus retryable: a
 * reference that does not verify will not verify on the next attempt either,
 * while a provider timeout usually will.
 *
 * Error text is deliberately generic. The previous handler serialised the raw
 * error into the response body, which for `PaymentHashMismatchError` meant
 * handing an attacker both the signed and the observed payment hash.
 */
export const invoiceErrorResponse = (e: unknown): InvoiceStatusResponse => {
  if (e instanceof InvalidInvoiceRefError) {
    return {
      httpStatus: 400,
      body: {
        settled: false,
        terminal: true,
        reason: 'invalid',
        error: 'Invalid or expired invoice reference',
      },
    };
  }

  if (e instanceof PaymentHashMismatchError) {
    return {
      httpStatus: 409,
      body: {
        settled: false,
        terminal: true,
        reason: 'invalid',
        error: 'Invoice reference does not match the payment',
      },
    };
  }

  if (e instanceof ProviderTimeoutError) {
    return {
      httpStatus: 504,
      body: {
        settled: false,
        retryable: true,
        error: 'Payment provider did not respond in time',
      },
    };
  }

  return {
    httpStatus: 500,
    body: {
      settled: false,
      retryable: true,
      error: 'Could not check the invoice',
    },
  };
};

/** Answer for a failed mint. Nothing exists to poll, so nothing is terminal. */
export const createInvoiceErrorResponse = (
  e: unknown,
): InvoiceStatusResponse => {
  if (e instanceof ProviderTimeoutError) {
    return {
      httpStatus: 504,
      body: {
        retryable: true,
        error: 'Payment provider did not respond in time',
      },
    };
  }
  return { httpStatus: 500, body: { error: 'Could not create an invoice' } };
};
