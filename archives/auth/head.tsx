import { Host } from "../../models/Host";
import notFound from "../../app/[slug]/not-found";

const getHost = async (slug: string): Promise<Host> => {
  const res = await fetch(`http://0.0.0.0:3000/api/hosts/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) notFound();
  const host = await res.json();
  return host.host;
}

export default async function Head({ params }: { params: { slug: string } }) {
  const host = await getHost(params.slug);
  const fullTitle = `PlebFM - ${host.hostName}`

  return (
    <title>{fullTitle}</title>
  )
}

