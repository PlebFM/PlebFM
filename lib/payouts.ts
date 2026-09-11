import mongoose from 'mongoose';
import Accounts from '../models/HostAccount';
import Payouts from '../models/Payout';
import { HttpError } from './http';
export async function reservePayout(
  hostId: string,
  requestId: string,
  amountSats: number,
  destination: string,
) {
  if (
    !Number.isSafeInteger(amountSats) ||
    amountSats < 1 ||
    !/^[-a-zA-Z0-9]{16,100}$/.test(requestId) ||
    typeof destination !== 'string' ||
    destination.length > 2000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination)
  )
    throw new HttpError(
      400,
      'Enter a positive whole-sat amount and a Lightning address',
    );
  const requestKey = `${hostId}:${requestId}`;
  await Payouts.init();
  let payout = await Payouts.findOne({ requestKey });
  if (payout) {
    if (payout.amountSats !== amountSats || payout.destination !== destination)
      throw new HttpError(409, 'Withdrawal details changed');
    return payout;
  }
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const existing = await Payouts.findOne({ requestKey }).session(session);
      if (existing) {
        payout = existing;
        return;
      }
      const account = await Accounts.findOneAndUpdate(
        { _id: hostId, balanceSats: { $gte: amountSats } },
        { $inc: { balanceSats: -amountSats, revision: 1 } },
        { session },
      );
      if (!account) throw new HttpError(409, 'Insufficient available sats');
      [payout] = await Payouts.create(
        [{ requestKey, hostId, amountSats, destination }],
        { session },
      );
    });
  } catch (error: any) {
    if (error.code === 11000) return Payouts.findOne({ requestKey });
    throw error;
  } finally {
    await session.endSession();
  }
  return payout;
}
export async function processPayout(payout: any) {
  if (['paid', 'failed'].includes(payout.state)) return payout;
  const { programmaticPayout, waitForPayoutResult } = await import(
    '@moneydevkit/core/server'
  );
  if (!payout.paymentId) {
    const result = await programmaticPayout({
      amountSats: payout.amountSats,
      destination: payout.destination,
      idempotencyKey: payout.requestKey,
    });
    if (result.error)
      throw new HttpError(
        503,
        'Withdrawal pending. Retry this withdrawal to check its status.',
      );
    await Payouts.updateOne(
      { _id: payout._id },
      { $set: { paymentId: result.data.paymentId, state: 'pending' } },
    );
  }
  const result = await waitForPayoutResult({
    idempotencyKey: payout.requestKey,
    timeoutMs: 3000,
  });
  if (result.error || result.data.status === 'REQUESTED')
    return Payouts.findById(payout._id);
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const current = await Payouts.findById(payout._id).session(session);
      if (['paid', 'failed'].includes(current.state)) return;
      if (result.data.status === 'SUCCESS') {
        current.state = 'paid';
      } else if (result.data.status === 'FAILED') {
        await Accounts.updateOne(
          { _id: current.hostId },
          { $inc: { balanceSats: current.amountSats, revision: 1 } },
          { session },
        );
        current.state = 'failed';
      } else {
        // Unknown terminal status — leave funds reserved and bail out so an
        // operator can investigate rather than silently losing the balance.
        return;
      }
      current.completedAt = new Date();
      await current.save({ session });
    });
  } finally {
    await session.endSession();
  }
  return Payouts.findById(payout._id);
}
