import { NextApiRequest, NextApiResponse } from 'next';
import {
  createInvoiceErrorResponse,
  encodeInvoiceRef,
  getPaymentProvider,
  getProviderByName,
  invoiceErrorResponse,
  resolveInvoiceRef,
  settleInvoice,
  unsettledResponse,
} from '../../lib/payments';
import { submitBid } from '../../lib/submit';
import connectDB from '../../middleware/mongodb';
import withJukebox from '../../middleware/withJukebox';

const createInvoice = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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
  } catch (e) {
    console.error(e);
    const { httpStatus, body } = createInvoiceErrorResponse(e);
    return res.status(httpStatus).json(body);
  }
};

const checkInvoice = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
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

    const { settled, paymentHash, expired } = await settleInvoice(
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

    // An expired invoice comes back flagged terminal, so the browser stops
    // polling instead of asking about a dead checkout every two seconds.
    const { httpStatus, body } = unsettledResponse(expired);
    return res.status(httpStatus).json(body);
  } catch (e) {
    // Errors are classified for the poller: a reference that does not verify is
    // the client's problem and terminal, while a provider timeout is retryable.
    const { httpStatus, body } = invoiceErrorResponse(e);
    // A rejected reference is routine noise on a public endpoint, and this is
    // reachable by anyone with a URL. A hash mismatch is not routine — that is
    // either an attack or the provider contradicting itself — so it stays loud.
    if (httpStatus === 400) console.warn(`Invoice reference rejected: ${e}`);
    else console.error(e);
    return res.status(httpStatus).json(body);
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') return createInvoice(req, res);
  if (req.method === 'GET') return checkInvoice(req, res);
  return res.status(405).json({ error: 'Method not supported' });
};
export default connectDB(withJukebox(handler));
