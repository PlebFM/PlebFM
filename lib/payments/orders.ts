import { randomUUID } from 'crypto';
import mongoose from 'mongoose';
import Orders from '../../models/PaymentOrder';
import Accounts from '../../models/HostAccount';
import Hosts from '../../models/Host';
import Plays from '../../models/Play';
import type { User } from '../../models/User';
import { getAccessToken, getTrack } from '../spotify';
import { getPaymentProvider, getProviderByName } from './registry';
import { HttpError } from '../http';
import { ensureDB } from '../db';
import { triggerBid } from '../pusher';
import type { InvoiceStatus } from './types';
import { planForHost } from '../subscriptions';

export async function createBidOrder(
  input: {
    shortName: string;
    songId: string;
    amountSats: number;
    requestId: string;
  },
  user: User,
) {
  if (
    !/^[a-z0-9-]{2,40}$/.test(input.shortName) ||
    !Number.isSafeInteger(input.amountSats) ||
    input.amountSats < 1 ||
    !/^[-a-zA-Z0-9]{16,100}$/.test(input.requestId) ||
    !/^[a-zA-Z0-9]{22}$/.test(input.songId)
  )
    throw new HttpError(400, 'Invalid bid details');
  await ensureDB();
  await Promise.all([Orders.init(), Accounts.init(), Plays.init()]);
  const requestKey = `${user.userId}:${input.requestId}`;
  const assertIntent = (order: any) => {
    if (
      !order ||
      order.shortName !== input.shortName ||
      order.song.id !== input.songId ||
      order.amountSats !== input.amountSats
    )
      throw new HttpError(409, 'This checkout belongs to a different bid');
    return order;
  };
  const existing = await Orders.findOne({ requestKey });
  if (existing) {
    assertIntent(existing);
    return existing.statusRef && existing.mintState !== 'ready'
      ? reconcileOrder(existing.orderId)
      : existing;
  }
  const host = await Hosts.findOne({
    shortName: input.shortName,
    deletedAt: null,
  });
  if (!host) throw new HttpError(404, 'Jukebox not found');
  const plan = await planForHost(host.hostId);
  const song = await getTrack(
    input.songId,
    (
      await getAccessToken()
    ).access_token,
  );
  if (
    song?.id !== input.songId ||
    !Number.isFinite(song.duration_ms) ||
    song.duration_ms <= 0 ||
    song.is_playable === false
  )
    throw new HttpError(400, 'This song is not available');
  const maxRate = Number(process.env.NEXT_PUBLIC_MAX_BID || 5000);
  if (input.amountSats > Math.floor((maxRate * song.duration_ms) / 60000))
    throw new HttpError(400, 'Bid exceeds the maximum for this song');
  const provider = getPaymentProvider();
  await Accounts.updateOne(
    { _id: host.hostId },
    { $setOnInsert: { balanceSats: 0 } },
    { upsert: true },
  );
  let order: any;
  let created = false;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      created = false;
      if (
        !(await Hosts.exists({ hostId: host.hostId, deletedAt: null }).session(
          session,
        ))
      )
        throw new HttpError(409, 'Jukebox closed');
      const prior = await Orders.findOne({ requestKey }).session(session);
      if (prior) {
        order = assertIntent(prior);
        return;
      }
      if (
        (await Orders.countDocuments({
          'user.userId': user.userId,
          state: 'pending',
        }).session(session)) >= 3
      )
        throw new HttpError(
          429,
          'Complete your pending checkouts before starting another',
        );
      const month = new Date().toISOString().slice(0, 7);
      const account = await Accounts.findById(host.hostId).session(session);
      // Serialize reservations and fulfillments for one venue on this account.
      if (account.month !== month) {
        account.month = month;
        account.songCount = 0;
      }
      if (plan.maxSongs && account.songCount >= plan.maxSongs)
        throw new HttpError(
          409,
          'This jukebox has reached its monthly song limit',
        );
      account.songCount += 1;
      account.revision += 1;
      await account.save({ session });
      [order] = await Orders.create(
        [
          {
            orderId: randomUUID(),
            requestKey,
            hostId: host.hostId,
            shortName: input.shortName,
            user,
            song: {
              id: song.id,
              name: song.name,
              duration_ms: song.duration_ms,
              artists: song.artists?.map((a: any) => ({ name: a.name })),
              album: { images: song.album?.images ?? [] },
            },
            reservationMonth: month,
            amountSats: input.amountSats,
            earnsRevenue: plan.id === 'pro',
            provider: provider.name,
          },
        ],
        { session },
      );
      created = true;
    });
  } catch (error: any) {
    if (error.code === 11000)
      return assertIntent(await Orders.findOne({ requestKey }));
    throw error;
  } finally {
    await session.endSession();
  }
  if (!created) return order;
  try {
    const invoice = await provider.createInvoice(
      `PlebFM — ${song.name}`,
      input.amountSats,
      { bidOrderId: order.orderId },
      async id => {
        await Orders.updateOne(
          { orderId: order.orderId },
          { $set: { statusRef: id } },
        );
      },
    );
    return await Orders.findOneAndUpdate(
      { orderId: order.orderId },
      {
        $set: {
          ...invoice,
          paymentRequest: invoice.paymentRequest,
          mintState: 'ready',
        },
      },
      { new: true },
    );
  } catch (error) {
    // An unknown result may still have created a payable invoice. Retrying the
    // same order must never create another one. Webhooks/admin reconciliation recover it.
    await Orders.updateOne(
      { orderId: order.orderId },
      { $set: { mintState: 'uncertain' } },
    );
    throw new HttpError(
      503,
      'Invoice creation is being reconciled. Retry this checkout; do not start a second payment.',
    );
  }
}

export async function fulfillBidOrder(orderId: string, status: InvoiceStatus) {
  if (!status.settled) return;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Orders.findOne({ orderId }).session(session);
      if (!order) throw new HttpError(404, 'Checkout not found');
      if (order.state === 'fulfilled') return;
      if (
        status.paymentHash !== order.paymentHash ||
        status.amountSats !== order.amountSats ||
        status.currency !== 'SAT'
      )
        throw new HttpError(409, 'Payment does not match its order');
      if (
        !Number.isSafeInteger(status.netAmountSats) ||
        status.netAmountSats! < 0 ||
        status.netAmountSats! > order.amountSats
      )
        throw new HttpError(503, 'Payment fees are not yet confirmed');
      const earned = order.earnsRevenue ? status.netAmountSats! : 0;
      await Accounts.updateOne(
        { _id: order.hostId },
        {
          $inc: {
            revision: 1,
            balanceSats: earned,
            earnedSats: earned,
            receivedSats: order.amountSats,
          },
        },
        { session },
      );
      let play = await Plays.findOne({
        hostId: order.hostId,
        songId: order.song.id,
        status: 'queued',
      }).session(session);
      const bid = {
        bidId: order.orderId,
        user: order.user,
        bidAmount: order.amountSats,
        timestamp: Date.now().toString(),
        rHash: order.paymentHash,
      };
      if (play) {
        play.bids.push(bid);
        play.runningTotal =
          (play.bids.reduce((n: number, b: any) => n + b.bidAmount, 0) * 60) /
          play.songLength;
        await play.save({ session });
      } else {
        [play] = await Plays.create(
          [
            {
              playId: randomUUID(),
              hostId: order.hostId,
              songId: order.song.id,
              status: 'queued',
              queueTimestamp: bid.timestamp,
              bids: [bid],
              runningTotal: (order.amountSats * 60000) / order.song.duration_ms,
              songLength: order.song.duration_ms / 1000,
              songArtist: order.song.artists?.[0]?.name ?? 'Unknown artist',
              songName: order.song.name,
              albumUri:
                order.song.album?.images?.[0]?.url || '/pleb-fm-favicon.svg',
            },
          ],
          { session },
        );
      }
      order.state = 'fulfilled';
      order.playId = play.playId;
      order.paidAt = new Date();
      order.netAmountSats = status.netAmountSats;
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
}
export async function notifyOrder(order: any) {
  if (order.state !== 'fulfilled' || order.notifiedAt) return;
  const play = await Plays.findOne({ playId: order.playId });
  if (!play) {
    await Orders.updateOne(
      { orderId: order.orderId },
      { $set: { notifiedAt: new Date() } },
    );
    return;
  }
  const bid = play.bids.find((b: any) => b.bidId === order.orderId);
  await triggerBid(
    order.user,
    play,
    bid,
    play.bids.length > 1,
    order.shortName,
  );
  await Orders.updateOne(
    { orderId: order.orderId },
    { $set: { notifiedAt: new Date() } },
  );
}
export async function reconcileOrder(orderId: string) {
  let order = await Orders.findOne({ orderId });
  if (!order) throw new HttpError(404, 'Checkout not found');
  if (order.provider === 'mdk' && order.statusRef && !order.paymentHash) {
    const { recoverMdkInvoice } = await import('./mdk');
    const invoice = await recoverMdkInvoice(
      order.statusRef,
      order.orderId,
      order.amountSats,
    );
    if (invoice)
      order = await Orders.findOneAndUpdate(
        { orderId },
        { $set: invoice },
        { new: true },
      );
  }
  if (order.state !== 'fulfilled' && order.statusRef && order.paymentHash) {
    const status = await getProviderByName(order.provider).checkInvoice(
      order.statusRef,
    );
    if (status.settled) await fulfillBidOrder(orderId, status);
    else if (status.expired) await expireOrder(orderId);
    order = await Orders.findOne({ orderId });
  }
  try {
    await notifyOrder(order);
  } catch {
    console.error('Bid notification deferred', order.orderId);
  }
  return order;
}

export async function expireOrder(orderId: string) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const order = await Orders.findOne({ orderId }).session(session);
      if (!order || order.state === 'fulfilled' || order.reservationReleased)
        return;
      await Accounts.updateOne(
        {
          _id: order.hostId,
          month: order.reservationMonth,
          songCount: { $gt: 0 },
        },
        { $inc: { songCount: -1, revision: 1 } },
        { session },
      );
      order.state = 'expired';
      order.reservationReleased = true;
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }
}
