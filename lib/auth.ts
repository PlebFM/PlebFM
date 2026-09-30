import Hosts from '../models/Host';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../pages/api/auth/[...nextauth]';
import { HttpError } from './http';
export function assertSameOrigin(req: NextApiRequest) {
  const origin = req.headers.origin;
  if (
    origin &&
    origin !== `https://${req.headers.host}` &&
    origin !== `http://${req.headers.host}`
  )
    throw new HttpError(403, 'Cross-origin request refused');
  if (req.headers['sec-fetch-site'] === 'cross-site')
    throw new HttpError(403, 'Cross-origin request refused');
}
export async function requireHostSession(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') assertSameOrigin(req);
  const session = await getServerSession(req, res, authOptions);
  if (
    !session?.user?.id ||
    session.error ||
    !(await Hosts.exists({ hostId: session.user.id, deletedAt: null }))
  ) {
    res.status(401).json({ error: 'Sign in to manage your jukebox' });
    return null;
  }
  return session as typeof session & { user: NonNullable<typeof session.user> };
}
