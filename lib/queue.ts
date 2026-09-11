import Plays from '../models/Play';
export async function getQueue(
  hostId: string,
  options: {
    userId?: string;
    includePlaying?: boolean;
    includeNext?: boolean;
    limit?: number;
  } = {},
) {
  const filter: any = { hostId };
  if (options.userId) filter['bids.user.userId'] = options.userId;
  else
    filter.status = {
      $in: [
        'queued',
        ...(options.includeNext !== false ? ['next'] : []),
        ...(options.includePlaying ? ['playing'] : []),
      ],
    };
  const plays = await Plays.find(filter)
    .sort({ runningTotal: -1, queueTimestamp: 1 })
    .limit(options.limit ?? 100)
    .lean();
  plays.sort((a: any, b: any) => {
    const rank: any = { playing: 0, next: 1, queued: 2 };
    return (
      (rank[a.status] ?? 3) - (rank[b.status] ?? 3) ||
      b.runningTotal - a.runningTotal ||
      Number(a.queueTimestamp) - Number(b.queueTimestamp)
    );
  });
  return plays.map((play: any) => ({
    ...play,
    bids: play.bids.map(({ rHash, ...bid }: any) => bid),
  }));
}
