import { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../../middleware/mongodb';

import Play from '../../../models/Play';

const playedStatus = 'played';
const notFoundErrorMessage = 'Song Not Found';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST') {
            throw new Error('InvalidRequestMethod');
        }

        if (!req.body.songId) {
            throw new Error('ExpectedSongIdToRemoveFromQueue');
        }

        const { songId } = req.body;

        const findSong = await Play.findOne({ songId });
        if (!findSong) {
            return res
                .status(404)
                .json({ success: false, message: notFoundErrorMessage });
        }

        const play = await Play.findOneAndUpdate(
            { songId },
            { status: playedStatus }
        );

        return res
            .status(200)
            .json({ success: true, new: false, message: play });
    } catch (error: any) {
        return res.status(400).json({ success: false, message: error.message });
    }
};

export default connectDB(handler);
