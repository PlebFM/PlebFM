import { NextApiRequest, NextApiResponse } from 'next';
import {
  decodeInvoiceRef,
  encodeInvoiceRef,
  getPaymentProvider,
  getProviderByName,
} from '../../lib/payments';
import { submitBid } from '../../lib/submit';
import connectDB from '../../middleware/mongodb';
import withJukebox from '../../middleware/withJukebox';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const provider = getPaymentProvider();
      const { memo, value } = req.body;
      const invoice = await provider.createInvoice(memo, parseInt(value));
      const signedRef = encodeInvoiceRef({
        provider: provider.name,
        statusRef: invoice.statusRef,
        paymentHash: invoice.paymentHash,
      });
      return res.status(200).json({
        payment_request: invoice.paymentRequest,
        // Both fields carry the signed reference. Clients that predate
        // `status_ref` poll with `payment_hash`, and the server resolves either.
        payment_hash: signedRef,
        status_ref: signedRef,
      });
    } else if (req.method === 'GET') {
      const { userId, hostId, hash, ref, songId, bidAmount } = req.query;
      if (!hostId || !songId || !bidAmount || !hash || !userId)
        throw new Error('Missing required params');

      // Everything the settlement depends on comes out of the signed reference,
      // never off the query string: a client that could name the settled
      // invoice and the bid's dedupe key separately could mint bids from one
      // payment. `hash` is accepted as a carrier because older clients send the
      // reference there, but its raw value is not trusted.
      const hashValue = decodeURIComponent(hash as string);
      const refValue = ref ? decodeURIComponent(ref as string) : null;
      const decoded =
        (refValue ? decodeInvoiceRef(refValue) : null) ??
        decodeInvoiceRef(hashValue);

      // Pre-token LNbits invoices are bare payment hashes. LNbits looks up by
      // payment hash, so settlement and identity stay bound for those.
      const invoiceRef = decoded ?? {
        provider: 'lnbits' as const,
        statusRef: hashValue,
        paymentHash: hashValue,
      };

      // Settle through the provider that minted it, not the one configured now,
      // so a cutover or rollback cannot strand an in-flight invoice.
      const provider = getProviderByName(invoiceRef.provider);
      const { settled, paymentHash } = await provider.checkInvoice(
        invoiceRef.statusRef,
      );
      const accessToken: string = req.headers.accessToken as string;

      if (settled) {
        console.log('PAID');
        // @ts-ignore
        const submitResult = await submitBid(
          hostId as string,
          paymentHash,
          songId as string,
          parseInt((bidAmount as string) ?? '0'),
          userId as string,
          accessToken,
        );
        return res.status(201).json({ settled: true, submit: submitResult });
      }
      return res.status(200).json({ settled });
    } else {
      return res.status(405).json({ error: 'Method not supported' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};
export default connectDB(withJukebox(handler));
