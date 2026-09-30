import { createHmac, timingSafeEqual } from 'crypto';
import type { NextApiRequest, NextApiResponse } from 'next';
const COOKIE = 'plebfm_guest';
function sign(value: string) {
  if (!process.env.NEXTAUTH_SECRET) throw new Error('NEXTAUTH_SECRET required');
  return createHmac('sha256', process.env.NEXTAUTH_SECRET)
    .update(value)
    .digest('hex');
}
export function guestId(req: NextApiRequest) {
  const raw = req.cookies?.[COOKIE];
  if (!raw) return null;
  const [id, signature] = raw.split('.');
  if (!id || !signature) return null;
  const a = Buffer.from(signature),
    b = Buffer.from(sign(id));
  return a.length === b.length && timingSafeEqual(a, b) ? id : null;
}
export function setGuest(res: NextApiResponse, id: string) {
  res.setHeader(
    'Set-Cookie',
    `${COOKIE}=${id}.${sign(
      id,
    )}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`,
  );
}
