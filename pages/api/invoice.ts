import { NextApiRequest, NextApiResponse } from 'next';
import {
  encodeInvoiceRef,
  getPaymentProvider,
  getProviderByName,
  InvalidInvoiceRefError,
  resolveInvoiceRef,
  settleInvoice,
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

      // Everything settlement depends on comes out of the signed reference,
      // never off the query string: a client able to name the settled invoice
      // and the bid's dedupe key separately could mint bids from one payment.
      const invoiceRef = resolveInvoiceRef(
        decodeURIComponent(hash as string),
        ref ? decodeURIComponent(ref as string) : null,
      );

      const { settled, paymentHash } = await settleInvoice(
        invoiceRef,
        getProviderByName,
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
    // A reference that does not verify is the client's problem, not a server
    // fault, and must not be retried against a different backend.
    if (e instanceof InvalidInvoiceRefError) {
      console.error(e.message);
      return res.status(400).json({ error: e.message });
    }
    console.error(e);
    return res.status(500).json(e);
  }
};
export default connectDB(withJukebox(handler));
