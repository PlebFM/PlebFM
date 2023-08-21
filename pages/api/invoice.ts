import { NextApiRequest, NextApiResponse } from 'next';
import { checkLnbitsInvoice, getLnbitsInvoice } from '../../lib/lnbits';
import { submitBid } from '../../lib/submit';

const checkInvoice = async (hash: string) => {
  const data = (await checkLnbitsInvoice(hash)) as { paid: boolean };
  if (data.paid) {
    console.log('PAID');
  }
  return { settled: data.paid };
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'POST') {
      const { memo, value } = JSON.parse(req.body);
      const data = await getLnbitsInvoice(memo, parseInt(value));
      return res.status(200).json(data);
    } else if (req.method === 'GET') {
      const { userId, hostId, hash, songId, bidAmount } = req.query;
      if (!hostId || !songId || !bidAmount || !hash || !userId)
        throw new Error('Missing required params');
      const rHash = decodeURIComponent(hash as string);
      const data = await checkInvoice(rHash);
      if (data.settled) {
        // @ts-ignore
        const submitResult = await submitBid(
          hostId,
          rHash,
          songId,
          bidAmount,
          userId,
        );
        return res.status(201).json({ settled: true, submit: submitResult });
      }
      return res.status(200).json(data);
      // } else if (req.method === 'PATCH'){
      //   const data = await getLnbitsInvoice();
      //   res.status(200).json(data);
    } else {
      return res.status(405).json({ error: 'Method not supported' });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};
export default handler;
