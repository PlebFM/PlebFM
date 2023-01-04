import { NextApiRequest, NextApiResponse } from 'next';
import cuid from 'cuid';
import Hosts from '../../../models/Host';
import Users from '../../../models/User';
import Plays, { Play } from '../../../models/Play';
import { Bid } from '../../../models/Bid';
import connectDB from '../../../middleware/mongodb';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method !== 'POST')
            return res
                .status(403)
                .json({ success: false, error: 'Forbidden!' });

        const { hostId, userId, rHash, songId, bidAmount } = req.body;
        const now: string = Date.now().toString();

        const host = await Hosts.findOne({ shortName: hostId });
        if (!host)
            return res
                .status(400)
                .json({ success: false, error: 'Host not found!' });
        console.error(host);

        const user = await Users.findOne({ userId: userId });
        if (!user)
            return res
                .status(400)
                .json({ success: false, error: 'User not found!' });
        console.error(user);

        const newBid: Bid = {
            bidId: cuid(),
            user: user,
            bidAmount: bidAmount,
            timestamp: now,
            rHash: rHash,
        };

        const rHashDuplicated = await Plays.findOne({
            'bids.rHash': { $eq: rHash },
        }).catch((e) => {
            console.error(e);
            throw new Error(e);
        });
        if (rHashDuplicated)
            return res
                .status(400)
                .json({ success: false, error: 'Duplicate rHash found!' });

        const newPlay: Play = await Plays.create({
            playId: cuid(),
            hostId: host.hostId,
            songId: songId,
            status: 'queued',
            queueTimestamp: now,
            playedTimestamp: undefined,
            bids: new Array<Bid>(newBid),
            runningTotal: bidAmount,
        }).catch((e: string | undefined) => {
            console.error(e);
            throw new Error(e);
        });

        return res
            .status(200)
            .json({ success: true, new: true, instance: newPlay });
    } catch (error: any) {
        return res.status(400).json({ success: false, error: error.message });
    }
};

export default connectDB(handler);
