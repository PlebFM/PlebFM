/**
 * Provider-agnostic Lightning payment contract.
 *
 * PlebFM only ever needs two things from a Lightning backend: mint an invoice
 * for a bid, and ask whether that invoice has been paid. Keeping that surface
 * this small is what makes swapping providers cheap.
 */

/**
 * A freshly minted invoice.
 *
 * `paymentHash` and `statusRef` are separate because not every provider looks
 * up status by payment hash. LNbits does, so the two are identical there. Money
 * Dev Kit looks up by checkout id, so they differ. `paymentHash` stays the
 * payment's identity (it is stored on the Bid as `rHash` and is what dedupes a
 * replayed bid), while `statusRef` is an opaque token only the provider reads.
 */
export type CreatedInvoice = {
  /** BOLT11 payment request, rendered as the QR the user scans. */
  paymentRequest: string;
  /** Payment hash. Stored on the Bid as `rHash`; used to dedupe bids. */
  paymentHash: string;
  /** Opaque handle passed back to `checkInvoice`. */
  statusRef: string;
};

export type InvoiceStatus = {
  settled: boolean;
  /**
   * Payment hash as the *provider* reports it for this `statusRef`.
   *
   * This is what the bid is recorded under. It must never be taken from the
   * request: a client that can name the settled invoice and separately name the
   * bid's dedupe key can mint bids from a single payment.
   */
  paymentHash: string;
};

export interface PaymentProvider {
  readonly name: 'lnbits' | 'mdk';
  /** Mint an invoice for `amountSats`. Throws if the provider returns no invoice. */
  createInvoice(memo: string, amountSats: number): Promise<CreatedInvoice>;
  /** Look up settlement state for a `statusRef` returned by `createInvoice`. */
  checkInvoice(statusRef: string): Promise<InvoiceStatus>;
}
