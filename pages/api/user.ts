import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import Users, {
    Adjectives,
    Characters,
    Colors,
    randomEnumValue,
    User,
} from '../../models/User';
import cuid from 'cuid';
import connectDB from '../../middleware/mongodb';

const getColorFromAdjective = (firstNym: any) => {
    const indexOfFirstNym = Object.keys(Adjectives).indexOf(firstNym);
    const colors = Object.values(Colors);
    const color = colors[indexOfFirstNym];
    return color;
};

const generateUser = () => {
    const userId = cuid();
    const firstNym = randomEnumValue(Adjectives);
    const lastNym = randomEnumValue(Characters);
    const avatar = getColorFromAdjective(firstNym);
    const user: User = {
        userId,
        firstNym,
        lastNym,
        avatar,
    };
    return user;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        if (req.method === 'POST') {
            // POST /api/user
            const user = await Users.create({ ...generateUser() });
            res.status(200).json({ success: true, message: user });
        } else if (req.method === 'GET') {
            // GET /api/user?userId=...
            const { userId } = req.query;
            if (!userId) throw new Error('userId is required');
            const user = await Users.find({ userId: userId });
            res.status(200).json({ success: true, message: user });
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};

export default connectDB(handler);
