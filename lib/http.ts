import type { NextApiRequest, NextApiResponse } from 'next';
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
export function sendError(res: NextApiResponse, error: unknown) {
  const status = error instanceof HttpError ? error.status : 503;
  if (status >= 500)
    console.error(
      'Request failed',
      error instanceof Error ? error.name : 'UnknownError',
    );
  return res.status(status).json({
    error:
      error instanceof HttpError
        ? error.message
        : 'Service temporarily unavailable. Please retry.',
  });
}
export function methodNotAllowed(res: NextApiResponse, methods: string[]) {
  res.setHeader('Allow', methods.join(', '));
  return res.status(405).json({ error: 'Method not allowed' });
}
export async function rawBody(req: NextApiRequest, limit = 1024 * 1024) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > limit) throw new HttpError(413, 'Request too large');
    chunks.push(bytes);
  }
  return Buffer.concat(chunks);
}
