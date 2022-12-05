"use client"

import { useSession, signIn, signOut, getSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Customers, { Customer } from '../../models/Customer';

const findHost = async (refreshToken: string) => {
  const params = new URLSearchParams({spotifyRefreshToken: refreshToken})
  const res = await fetch(`http://localhost:3000/api/customers?${params}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json'
    },
  });
  return await res.json();
}
const findOrCreateNewHost = async (shortName: string, customerName: string, refreshToken: string): Promise<Customer> => {
  const body = { shortName, customerName, refreshToken };
  const res = await fetch("http://localhost:3000/api/customers", {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body)
  });
  return await res.json();
};

async function searchSong(query: string, shortName: string) {
  if (query === "") return ""; 
  const res = await fetch (
    `/api/spotify/search?${new URLSearchParams({ query: query, shortName: shortName})}`,
    {method: 'GET'}
  );
  if (!res.ok) return ['failed'];
  const result = await res.json();
  return result.items;
}
const SpotifyAuthButton = () => {
  const { data: session } = useSession();
  const [ customer, setCustomer ] = useState<Customer | null>(null);
  const [ query, setQuery ] = useState('');
  const [ searchRes, setSearchRes ] = useState([]);
  useEffect(() => {
    const getCustomer = async () => {
      if (!session) return;
      // @ts-ignore
      const refreshToken = session.refreshToken;
      const findRes = await findHost(refreshToken);
      if (findRes) {
        setCustomer(findRes);
        return;
      }
      const res = await findOrCreateNewHost('testShort', 'testLong', refreshToken);
      setCustomer(res);
    }
    getCustomer();
  }, [session]);

  useEffect(() => {
    const updateSearch = async () => {
      const results = await searchSong(query, 'atl');
      setSearchRes(results);
    };
    updateSearch();

  }, [query])


  if (session) {
    return (
      <>
        <p>Signed in as {session?.user?.email ?? 'Spotify User'}</p> <br />
        <button onClick={() => signOut()}>Sign out</button>
        <p>Customer Obj: {customer ? JSON.stringify(customer) : '...' }</p> <br />
        <input
          type="text"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
          <ol>
            {searchRes ? searchRes.map((x, i) =>
              <li key={i}>{x.name}</li>
            ) : <li>Loading</li>}
          </ol>
      </>
    );
  }
  return (
    <>
      <p>Not signed in</p><br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  ); 

};

export default SpotifyAuthButton;