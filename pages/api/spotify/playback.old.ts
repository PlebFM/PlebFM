import { NextApiRequest, NextApiResponse } from 'next';
import { getPlaybackState, getTrack } from '../../../lib/spotify';
import withJukebox from '../../../middleware/withJukebox';

// req.query.id ==> spotify trackId
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //@ts-ignore
  const accessToken: string = req.headers.accessToken;
  const response = await getPlaybackState(accessToken);
  console.error(response);
  if (response?.status >= 400)
    return res.status(400).send(`getSong failed: ${await response.text()}`);

  return res.status(200).json(response);
};

export default withJukebox(handler);
