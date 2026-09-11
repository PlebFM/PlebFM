// Scheduled functions have a 30s limit. Dispatch a background function, which
// can wait for the existing bounded Next.js reconciliation endpoint to finish.
export default async function schedule(_request, context) {
  if (context.deploy.context !== 'production' || !context.deploy.published)
    return;
  if (!process.env.CRON_SECRET) throw Error('CRON_SECRET is not configured');
  const url = new URL(
    '/.netlify/functions/reconcile-background',
    context.site.url,
  );
  if (url.protocol !== 'https:') throw Error('HTTPS production URL required');
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
    redirect: 'error',
    signal: AbortSignal.timeout(8000),
  });
  if (response.status !== 202)
    throw Error(`Reconciliation dispatch failed (${response.status})`);
}
export const config = { schedule: '* * * * *' };
