import mongoose from 'mongoose';
import Hosts from '../../models/Host';
import Accounts from '../../models/HostAccount';
import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '../../middleware/mongodb';
import { requireHostSession } from '../../lib/auth';
import { planForHost } from '../../lib/subscriptions';
import {
  domainChallenge,
  validateDomain,
  verifyDomain,
  removeDomain,
} from '../../lib/domains';
import Domains from '../../models/CustomDomain';
import { HttpError, methodNotAllowed } from '../../lib/http';
export default connectDB(async (req: NextApiRequest, res: NextApiResponse) => {
  if (!['GET', 'POST', 'DELETE'].includes(req.method ?? ''))
    return methodNotAllowed(res, ['GET', 'POST', 'DELETE']);
  const session = await requireHostSession(req, res);
  if (!session) return;
  const hostId = session.user.id!;
  if (req.method === 'DELETE') await removeDomain(hostId);
  if (req.method === 'POST') {
    if ((await planForHost(hostId)).id === 'free')
      throw new HttpError(403, 'Custom domains require Basic or Pro');
    if (req.body.action === 'verify') await verifyDomain(hostId);
    else {
      const domain = validateDomain(req.body.domain);
      const old = await Domains.findOne({ hostId });
      if (old && old.domain !== domain)
        throw new HttpError(
          409,
          'Remove the current domain before replacing it',
        );
      await Promise.all([Domains.init(), Accounts.init()]);
      const transaction = await mongoose.startSession();
      try {
        await transaction.withTransaction(async () => {
          await Accounts.updateOne(
            { _id: hostId },
            { $inc: { revision: 1 } },
            { upsert: true, session: transaction },
          );
          if (
            !(await Hosts.exists({ hostId, deletedAt: null }).session(
              transaction,
            ))
          )
            throw new HttpError(409, 'Jukebox closed');
          await Domains.updateOne(
            { hostId },
            { $setOnInsert: { hostId, domain } },
            { upsert: true, session: transaction },
          );
        });
      } catch (e: any) {
        if (e.code === 11000)
          throw new HttpError(409, 'Domain already registered');
        throw e;
      } finally {
        await transaction.endSession();
      }
    }
  }
  const item = await Domains.findOne({ hostId }).lean();
  return res.json({
    domain: item,
    challenge: item
      ? {
          name: `_plebfm.${item.domain}`,
          value: domainChallenge(hostId, item.domain),
        }
      : null,
  });
});
