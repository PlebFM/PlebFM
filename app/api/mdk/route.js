import {
  POST as sdkPost,
  GET as sdkGet,
} from '@moneydevkit/nextjs/server/route';
// Keep MDK's authenticated node callbacks and signed renewal links. Checkout
// creation belongs to PlebFM's authenticated/order-backed APIs. Never expose
// customer lookup or the SDK's preview payment simulation to the public.
export async function POST(request) {
  let body;
  try {
    body = await request.clone().json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const route = [body.handler, body.route, body.target]
    .find(v => typeof v === 'string')
    ?.toLowerCase();
  if (
    ![
      'webhook',
      'webhooks',
      'balance',
      'ping',
      'list_channels',
      'sync_rgs',
      'get_checkout',
      'confirm_checkout',
    ].includes(route)
  )
    return Response.json({ error: 'Operation unavailable' }, { status: 403 });
  if (
    route === 'confirm_checkout' &&
    (body.confirm?.products || body.confirm?.customer)
  )
    return Response.json(
      { error: 'Checkout details are fixed' },
      { status: 403 },
    );
  return sdkPost(request);
}
export async function GET(request) {
  // Only signed subscription renewal/cancellation and the SDK's own CSRF
  // bootstrap may use GET. Signed generic checkout links aren't used here.
  if (new URL(request.url).searchParams.get('action') === 'createCheckout')
    return Response.json({ error: 'Use PlebFM checkout' }, { status: 403 });
  return sdkGet(request);
}
