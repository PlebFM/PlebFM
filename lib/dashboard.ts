import Hosts from '../models/Host';
import Accounts from '../models/HostAccount';
import Orders from '../models/PaymentOrder';
import { getQueue } from './queue';
import { publicHost } from './public-host';
import { planForHost, subscriptionForHost } from './subscriptions';
export async function dashboardData(hostId: string) {
  const host = await Hosts.findOne({ hostId, deletedAt: null });
  if (!host?.shortName) return null;
  const [queue, account, subscription, plan, daily] = await Promise.all([
    getQueue(hostId, { includePlaying: true }),
    Accounts.findById(hostId).lean(),
    subscriptionForHost(hostId),
    planForHost(hostId),
    Orders.aggregate([
      {
        $match: {
          hostId,
          state: 'fulfilled',
          paidAt: { $gte: new Date(Date.now() - 30 * 86400000) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          bids: { $sum: 1 },
          sats: { $sum: '$amountSats' },
          earnedSats: {
            $sum: { $cond: ['$earnsRevenue', '$netAmountSats', 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);
  return {
    host: publicHost(host),
    queueData: queue,
    subscription,
    currentPlan: plan,
    stats: {
      receivedSats: account?.receivedSats ?? 0,
      earnedSats: account?.earnedSats ?? 0,
      balanceSats: account?.balanceSats ?? 0,
      daily,
    },
  };
}
