"use client"

import { useEffect, useState } from "react";

async function searchSong(query: string) {
  if (query === "") {
  }

  const res = await fetch(`/api/spotify/search?${new URLSearchParams({ query: query })}`);
  if (!res.ok) throw new Error('Failed to search song');
}

export default function SearchBox() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchRes, setSearchRes] = useState([]);

  useEffect(() => {
    const updateSearch = async () => {
      setLoading(true);
      const results = await searchSong(query);
      setLoading(false);
      return results;
    };
    updateSearch();

  }, [query])

  return (
    <>
      <p>SearchBox</p>
      <input
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
      >
      </input>
    </>
  );
}