import type { NextApiRequest, NextApiResponse } from 'next';
import { requireHostSession } from '../../../lib/auth';
import { getPlaybackState } from '../../../lib/spotify';
import { sendError, methodNotAllowed } from '../../../lib/http';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  try {
    const session = await requireHostSession(req, res);
    if (!session) return;
    return res.json(await getPlaybackState(session.accessToken!));
  } catch (e) {
    return sendError(res, e);
  }
}
