import { useEffect, useState } from 'react';
import { cleanSong } from '../../pages/[slug]/queue';
import { User } from '../../models/User';
import { SongObject } from '../../pages/[slug]/queue';
import { getUserProfileFromLocal } from '../../utils/profile';
import { Play } from '../../models/Play';
import { usePathname } from 'next/navigation';

const fetchSong = async (
  query: string,
  shortName: string,
): Promise<{ name: string; artists: { name: string }[]; id: string }[]> => {
  if (query === '') return [];
  const queryString = new URLSearchParams({
    query: query,
    shortName: shortName,
    limit: '10',
  });
  const res = await fetch(`/api/spotify/search?${queryString}`, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
  if (!res.ok) throw new Error('Failed to search song');
  return (await res.json()).items;
};

const getQueue = async (
  host: string,
  user: User,
): Promise<Map<string, SongObject>> => {
  let url = `/api/leaderboard/queue?playing=${true}&shortName=${host}`;
  const response = await fetch(url);
  const res = await response.json();
  if (!res?.data) {
    return new Map();
  }
  const songs: Array<[string, SongObject]> = res.data.map((song: Play) => [
    song.songId,
    cleanSong(song, user),
  ]);
  return new Map(songs);
};

export const useSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResult, setSearchResult] = useState<
    { name: string; artists: { name: string }[]; id: string }[]
  >([]);
  const [queue, setQueue] = useState<Map<string, SongObject>>();
  const [loading, setLoading] = useState(true);

  const name = usePathname()?.replaceAll('/', '') || '';

  useEffect(() => {
    const userProfile = getUserProfileFromLocal();
    const fetchQueue = async () => {
      const queue = await getQueue(name, userProfile);
      if (queue) setQueue(queue);
    };
    fetchQueue();
  }, [name]);

  useEffect(() => {
    setLoading(true);
    if (!searchTerm || !name) {
      setSearchResult([]);
      setLoading(false);
      return;
    }
    const search = setTimeout(async () => {
      const results = (await fetchSong(searchTerm.trim(), name)) ?? [];
      setSearchResult(results);
      setLoading(false);
    }, 300);

    return () => clearTimeout(search);
  }, [searchTerm, name]);

  return { setSearchTerm, searchTerm, searchResult, queue, loading };
};
