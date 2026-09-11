import { HttpError } from './http';
async function request(path: string, body?: unknown) {
  const key = process.env.LNBITS_API_KEY;
  if (!key || !process.env.LNBITS_URL)
    throw new HttpError(503, 'LNbits is not configured');
  const response = await fetch(`${process.env.LNBITS_URL}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json', 'X-Api-Key': key },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(8000),
    redirect: 'error',
  });
  if (!response.ok) throw new HttpError(503, 'LNbits is unavailable');
  try {
    return await response.json();
  } catch {
    throw new HttpError(503, 'LNbits returned an invalid response');
  }
}
export const checkLnbitsInvoice = (hash: string) =>
  request(`/api/v1/payments/${encodeURIComponent(hash)}`);
export const getLnbitsInvoice = (memo: string, amount: number) => {
  if (!Number.isSafeInteger(amount) || amount < 1)
    throw new HttpError(400, 'Invalid amount');
  return request('/api/v1/payments', {
    out: false,
    amount,
    memo,
    expiry: 3600,
    unit: 'sat',
  });
};
