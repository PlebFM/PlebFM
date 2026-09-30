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
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return Response.json({ error: 'Invalid JSON object' }, { status: 400 });
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
  // Strip all routing fields and reconstruct the body with only the validated
  // route name, so the SDK cannot be directed by a smuggled secondary field.
  const { handler: _h, route: _r, target: _t, ...rest } = body;
  // The SDK resolves handler/route/target; a property named after the operation
  // is not a routing discriminator. Pass exactly one canonical discriminator.
  const safeBody = { ...rest, handler: route };
  const headers = new Headers(request.headers);
  headers.set('content-type', 'application/json');
  headers.delete('content-length');
  const safeRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: JSON.stringify(safeBody),
  });
  return sdkPost(safeRequest);
}
export async function GET(request) {
  // Only signed subscription renewal/cancellation and the SDK's own CSRF
  // bootstrap may use GET. Signed generic checkout links aren't used here.
  if (new URL(request.url).searchParams.get('action') === 'createCheckout')
    return Response.json({ error: 'Use PlebFM checkout' }, { status: 403 });
  return sdkGet(request);
}
