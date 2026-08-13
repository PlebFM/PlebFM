import { NextApiRequest, NextApiResponse } from 'next';
import { getPaymentProvider } from '../../lib/payments';
import { submitBid } from '../../lib/submit';
import connectDB from '../../middleware/mongodb';
import withJukebox from '../../middleware/withJukebox';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const provider = getPaymentProvider();

    if (req.method === 'POST') {
      const { memo, value } = req.body;
      const invoice = await provider.createInvoice(memo, parseInt(value));
      return res.status(200).json({
        payment_request: invoice.paymentRequest,
        payment_hash: invoice.paymentHash,
        status_ref: invoice.statusRef,
      });
    } else if (req.method === 'GET') {
      const { userId, hostId, hash, ref, songId, bidAmount } = req.query;
      if (!hostId || !songId || !bidAmount || !hash || !userId)
        throw new Error('Missing required params');
      const rHash = decodeURIComponent(hash as string);
      // Providers that do not key status off the payment hash (Money Dev Kit
      // uses a checkout id) send it back as `ref`. Older clients omit it.
      const statusRef = ref ? decodeURIComponent(ref as string) : rHash;
      const { settled } = await provider.checkInvoice(statusRef);
      const accessToken: string = req.headers.accessToken as string;
      if (settled) {
        console.log('PAID');
        // @ts-ignore
        const submitResult = await submitBid(
          hostId as string,
          rHash,
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
