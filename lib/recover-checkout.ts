import Orders from '../models/PaymentOrder';
import Billing from '../models/BillingCheckout';
import { PLANS } from '../models/Subscription';
import { HttpError } from './http';
// Operator recovery for a create response lost before its ID was saved. The
// provider still has to prove the original metadata, currency and price.
export async function recoverCheckout(input: {
  checkoutId: string;
  orderId?: string;
  billingRequestKey?: string;
}) {
  if (
    typeof input.checkoutId !== 'string' ||
    input.checkoutId.length > 200 ||
    !!input.orderId === !!input.billingRequestKey
  )
    throw new HttpError(
      400,
      'Supply a checkout ID and exactly one saved order reference',
    );
  const { getCheckout } = await import('@moneydevkit/core');
  const checkout = await getCheckout(input.checkoutId);
  if (checkout.sandbox) throw new HttpError(409, 'Sandbox checkout refused');
  if (input.orderId) {
    const order = await Orders.findOne({
      orderId: input.orderId,
      provider: 'mdk',
    });
    if (
      !order ||
      checkout.userMetadata?.bidOrderId !== order.orderId ||
      checkout.currency !== 'SAT' ||
      checkout.totalAmount !== order.amountSats ||
      (order.statusRef && order.statusRef !== checkout.id)
    )
      throw new HttpError(409, 'Checkout does not match saved bid');
    await Orders.updateOne(
      {
        _id: order._id,
        $or: [{ statusRef: { $exists: false } }, { statusRef: checkout.id }],
      },
      { $set: { statusRef: checkout.id } },
    );
  } else {
    const order = await Billing.findOne({
      requestKey: input.billingRequestKey,
    });
    if (
      !order ||
      checkout.userMetadata?.billingRequestKey !== order.requestKey ||
      checkout.currency !== 'USD' ||
      checkout.totalAmount !== PLANS.find(p => p.id === order.planId)?.price ||
      (order.checkoutId && order.checkoutId !== checkout.id)
    )
      throw new HttpError(409, 'Checkout does not match saved plan');
    await Billing.updateOne(
      {
        _id: order._id,
        $or: [{ checkoutId: { $exists: false } }, { checkoutId: checkout.id }],
      },
      { $set: { checkoutId: checkout.id, state: 'pending' } },
    );
  }
}
