import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import schedule from '../../netlify/functions/reconcile-schedule.mjs';
import reconcile from '../../netlify/functions/reconcile-background.mjs';
const context = {
  deploy: { context: 'production', published: true },
  site: { url: 'https://site.example' },
};
const request = (token = 'fixture-secret') =>
  new Request('https://site.example/.netlify/functions/reconcile-background', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv('CRON_SECRET', 'fixture-secret');
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it('dispatches a background invocation and does not wait inside the schedule for reconciliation', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 202 }));
  await schedule(request(), context);
  expect(fetchMock).toHaveBeenCalledWith(
    new URL('https://site.example/.netlify/functions/reconcile-background'),
    expect.objectContaining({
      method: 'POST',
      redirect: 'error',
      headers: { Authorization: 'Bearer fixture-secret' },
    }),
  );
});
it('never dispatches from a preview or an unpublished production deployment', async () => {
  await schedule(request(), {
    ...context,
    deploy: { context: 'deploy-preview', published: false },
  });
  await schedule(request(), {
    ...context,
    deploy: { context: 'production', published: false },
  });
  expect(fetchMock).not.toHaveBeenCalled();
});
it('rejects unauthenticated worker calls before any API request', async () => {
  expect((await reconcile(request('wrong-secret'), context))?.status).toBe(401);
  expect(fetchMock).not.toHaveBeenCalled();
});
it('reports failed reconciliation for platform retries', async () => {
  fetchMock.mockResolvedValue(new Response(null, { status: 503 }));
  await expect(reconcile(request(), context)).rejects.toThrow(
    'Reconciliation failed (503)',
  );
  expect(fetchMock).toHaveBeenCalledWith(
    new URL('https://site.example/api/jobs/reconcile'),
    expect.objectContaining({ redirect: 'error' }),
  );
});
it('fails before sending a secret to an HTTP endpoint', async () => {
  await expect(
    schedule(request(), { ...context, site: { url: 'http://site.example' } }),
  ).rejects.toThrow('HTTPS');
  expect(fetchMock).not.toHaveBeenCalled();
});
