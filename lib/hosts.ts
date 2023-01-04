import { notFound } from 'next/navigation';
import { Host } from '../models/Host';

export const getHosts = async (): Promise<Host[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const hosts = await res.json();
  return hosts.hosts;
};

export const getHost = async (slug: string): Promise<Host> => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/hosts/${slug}`,
    {
      method: 'GET',
      mode: 'no-cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
  if (!res.ok) {
    if (res.status === 400) return null;
    throw new Error('unable to fetch data');
  }
  const host = await res.json();
  return host.host;
};
