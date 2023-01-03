import { notFound } from 'next/navigation';
import { Host } from "../models/Host";

export const getHosts = async (): Promise<Host[]> => {
  const res = await fetch("http://localhost:3000/api/hosts?shortName=atl", {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const response = await res.json();
  return response.message;
}

export const getHost = async (slug: string): Promise<Host> => {
  const res = await fetch(`http://localhost:3000/api/hosts/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) {
    if (res.status === 400) return notFound();;
    throw new Error('unable to fetch data');
  }
  const response = await res.json();
  return response.message;
}