import { sendError, HttpError, methodNotAllowed } from '../../lib/http';
import { NextApiRequest, NextApiResponse } from 'next';
import Users, {
  Adjectives,
  Characters,
  Colors,
  randomEnumValue,
  User,
} from '../../models/User';
import { createId } from '@paralleldrive/cuid2';
import connectDB from '../../middleware/mongodb';
import { guestId, setGuest } from '../../lib/guest';
import { assertSameOrigin } from '../../lib/auth';

const getColorFromAdjective = (firstNym: any) => {
  const indexOfFirstNym = Object.keys(Adjectives).indexOf(firstNym);
  const colors = Object.values(Colors);
  const color = colors[indexOfFirstNym];
  return color;
};

const generateUser = () => {
  const userId = createId();
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
      assertSameOrigin(req);
      const currentId = guestId(req);
      const current = currentId
        ? await Users.findOne({ userId: currentId })
        : null;
      if (current)
        return res.status(200).json({ success: true, user: current });
      const user: User = { ...generateUser() };
      const result = await Users.create(user);
      setGuest(res, user.userId);
      res.status(200).json({ success: true, user: result });
    } else if (req.method === 'GET') {
      // GET /api/user?userId=...
      const { userId } = req.query;
      if (typeof userId !== 'string')
        throw new HttpError(400, 'userId is required');
      const result = await Users.find({ userId: userId });
      res.status(200).json({ success: true, user: result });
    } else return methodNotAllowed(res, ['GET', 'POST']);
  } catch (error: any) {
    return sendError(res, error);
  }
};

export default connectDB(handler);
