import { NextApiRequest, NextApiResponse } from 'next';
import Users from '../../../models/User';
import connectDB from '../../../middleware/mongodb';
import Play from '../../../models/Play';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const { userId } = req.query;

        const user = await Users.findOne({ userId });
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found!" });
        }

        const bids = await Play.findOneAndUpdate(
            { songId },
            { status: playedStatus }
        );

        return res
            .status(200)
            .json({ success: true, new: false, message: play });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export default connectDB(handler);
