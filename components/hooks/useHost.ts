import { useState, useEffect } from 'react';

export interface Host {
  hostName: string;
  shortName: string;
  spotifyId: string;
  hostId: string;
}

export function useHost(shortName: string) {
  const [host, setHost] = useState<Host | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHost() {
      if (!shortName) return;

      try {
        const response = await fetch(`/api/hosts/${shortName}`);
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch host');
        }

        setHost(data.host);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch host');
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    setError(null);
    fetchHost();
  }, [shortName]);

  return { host, isLoading, error };
}

export function useHosts() {
  const [hosts, setHosts] = useState<Host[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHosts() {
      try {
        const response = await fetch('/api/hosts');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch hosts');
        }

        setHosts(data.hosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch hosts');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHosts();
  }, []);

  return { hosts, isLoading, error };
}
