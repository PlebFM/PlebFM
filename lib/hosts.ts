import { Host } from '../models/Host';

export const getHosts = async (
  url: string = process.env.NEXT_PUBLIC_BASE_URL || '',
): Promise<Host[]> => {
  const res = await fetch(`${url}/api/hosts`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const hosts = await res.json();
  return hosts.hosts;
};

export const getHost = async (
  slug: string,
  url: string = process.env.NEXT_PUBLIC_BASE_URL || '',
): Promise<Host | null> => {
  if (!url) {
    console.error('URL is required for getHost');
    return null;
  }
  try {
    const res = await fetch(`${url}/api/hosts/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch host: ${res.statusText}`);
    }

    const data = await res.json();
    return data.host;
  } catch (error) {
    console.error('Error fetching host:', error);
    return null;
  }
};
