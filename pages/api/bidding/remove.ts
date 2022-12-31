import { NextApiRequest, NextApiResponse } from "next";

import Instance from "../../../models/Instance";

const playedStatus = 'played';
const notFoundErrorMessage = 'Song Not Found';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method !== 'POST' ) {
      throw new Error('InvalidRequestMethod');
    }

    if (!req.body.songId) {
      throw new Error('ExpectedSongIdToRemoveFromQueue');
    }
    
    const {songId} = req.body;
  
    const findSong = await Instance.findOne({ songId });
    if (!findSong) {
      return res.status(404).json({ success: false, error: notFoundErrorMessage });
    }
  
    const instance = await Instance.findOneAndUpdate({songId}, {status: playedStatus});

    return res.status(200).json({ success: true, new: false, instance: instance });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export default handler;