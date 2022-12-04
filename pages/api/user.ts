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

const getColorFromAdjective = (firstNym: any) => {
    const indexOfFirstNym = Object.keys(Adjectives).indexOf(firstNym);
    const colors = Object.values(Colors);
    const color = colors[indexOfFirstNym];
    return color;
};

// getColorFromAdjective(randomEnumValue(Adjectives));

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
            const user: User = { ...generateUser() };
            const result = await Users.create(user);
            console.log('result: ', result);
            res.status(200).json({ success: true, user: result });
        } else if (req.method === 'GET') {
            // GET /api/user?userId=...
            const { userId } = req.query;
            if (!userId) throw new Error('userId is required');
            const result = await Users.find({ userId: userId });
            console.log('result: ', result);
            res.status(200).json({ success: true, user: result });
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
};

export default handler;
