import { NextApiRequest, NextApiResponse } from 'next';
import withJukebox from '../../../middleware/withJukebox';
import { searchTrack } from '../../../lib/spotify';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //@ts-ignore
  const query: string = req.query.query ?? '';
  //@ts-ignore
  const limit: string = req.query.limit ?? '';
  //@ts-ignore
  const accessToken: string = req.headers.accessToken;
  const response = await searchTrack(query, accessToken, limit);
  if (response?.status >= 400)
    return res.status(400).send(`searchTrack failed: ${await response.text()}`);

  return res.status(200).json(response);
};

export default connectDB(withJukebox(handler));
