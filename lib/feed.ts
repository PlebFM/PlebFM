import { Update } from '../models/Feed';

export const updateFeed = async (
  type: string,
  slug: any,
  userId: string,
  songId: string | undefined = undefined,
): Promise<Update> => {
  const res = await fetch(`/api/feed/update`, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({
      type: type,
      hostShortName: slug,
      userId: userId,
      songId: songId,
      timestamp: Date.now(),
    }),
  });
  console.log(res);

  const update = await res.json();
  return update;
};
