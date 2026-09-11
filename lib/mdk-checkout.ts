import {
  createMoneyDevKitClient,
  deriveNodeIdFromConfig,
  is_preview_environment,
} from '@moneydevkit/core';
import type { CreateCheckoutOptions } from '@moneydevkit/core';
import { withDeadline } from './payments/deadline';
// Persist the provider reference BEFORE an invoice can become payable. A retry
// resumes that checkout rather than creating a second payment request.
export async function createDurableCheckout(
  fields: CreateCheckoutOptions,
  save: (id: string) => Promise<void>,
) {
  if (is_preview_environment())
    throw new Error('Sandbox checkouts cannot credit real accounts');
  const client = createMoneyDevKitClient();
  const checkout = await withDeadline('create checkout', () =>
    client.checkouts.create(fields, deriveNodeIdFromConfig()),
  );
  await save(checkout.id);
  return checkout.status === 'CONFIRMED'
    ? withDeadline('mint invoice', () =>
        client.checkouts.mintInvoice({ checkoutId: checkout.id }),
      )
    : checkout;
}
