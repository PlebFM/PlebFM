"use client"

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import SearchResults from "./SearchResults";

const fetchSong = async (query: string, shortName: string): Promise<{name: string}[]> => {
  if (query === "") return [];
  const queryString = new URLSearchParams({ query: query, shortName: shortName });
  const res = await fetch(`/api/spotify/search?${queryString}`, {
    headers: { 'Access-Control-Allow-Origin': '*' }
  });
  if (!res.ok) throw new Error('Failed to search song');
  return (await res.json()).items;
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchRes, setSearchRes] = useState<string[]>([]);
  const name = usePathname()?.replaceAll('/', "") || "";

  useEffect(() => {
    if (!query || !name) {
      setSearchRes([]);
      return;
    }
    const updateSearch = setTimeout(async () => {
      setLoading(true);
      const results = await fetchSong(query.trim(), name) ?? [];
      setSearchRes(results.map(x => x.name));
      setLoading(false);
      return results;
    }, 1);

    return () => clearTimeout(updateSearch);
  }, [query, name])

  return (
    <>
      <p>SearchBox</p>
      <span>
        Search:{'  '}   
        <input
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
          autoComplete='off'

        />
      </span>
      {loading && "loading"} 
      <SearchResults songs={searchRes} />
    </>
  );
}