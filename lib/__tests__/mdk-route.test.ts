import { beforeEach, expect, it, vi } from 'vitest';
const post = vi.hoisted(() => vi.fn(async () => new Response('ok')));
vi.mock('@moneydevkit/nextjs/server/route', () => ({ POST: post, GET: post }));
import { POST } from '../../app/api/mdk/route';
beforeEach(() => vi.clearAllMocks());
const req = (body: unknown) =>
  new Request('https://pleb.fm/api/mdk', {
    method: 'POST',
    body: JSON.stringify(body),
  });
it.each(['create_checkout', 'get_customer', 'pay_invoice', 'list_products'])(
  'blocks SDK %s before it can bypass app rules',
  async handler => {
    expect((await POST(req({ handler }))).status).toBe(403);
    expect(post).not.toHaveBeenCalled();
  },
);
it('refuses product and external customer changes on hosted checkout', async () => {
  expect(
    (
      await POST(
        req({
          handler: 'confirm_checkout',
          confirm: { checkoutId: 'id', products: [{ productId: 'other' }] },
        }),
      )
    ).status,
  ).toBe(403);
});
it('delegates node callback authentication to the SDK', async () => {
  await POST(req({ handler: 'webhook' }));
  expect(post).toHaveBeenCalledOnce();
});
