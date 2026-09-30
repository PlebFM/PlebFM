import Subscriptions from '../models/HostSubscription';
// A slower response from an earlier refresh must not overwrite a newer read.
export async function saveSubscription(
  provider: string,
  externalId: string,
  values: Record<string, unknown>,
  checkedAt: Date,
) {
  await Subscriptions.init();
  const filter = {
    provider,
    externalId,
    $or: [
      { checkedAt: { $lte: checkedAt } },
      { checkedAt: { $exists: false } },
    ],
  };
  try {
    await Subscriptions.updateOne(
      filter,
      { $set: { ...values, checkedAt } },
      { upsert: true },
    );
  } catch (error: any) {
    if (error.code !== 11000) throw error;
    await Subscriptions.updateOne(filter, { $set: { ...values, checkedAt } });
  }
}
