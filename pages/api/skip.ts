import type { NextApiRequest, NextApiResponse } from 'next';
import { requireHostSession } from '../../lib/auth';
import { skipSong } from '../../lib/spotify';
import { HttpError, methodNotAllowed, sendError } from '../../lib/http';
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  try {
    const session = await requireHostSession(req, res);
    if (!session) return;
    await skipSong(session.accessToken!);
    return res.json({ success: true });
  } catch (e) {
    return sendError(res, e);
  }
}
