import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getHost, getHosts } from '../../lib/hosts';
import SpotifyAuthButton from './SpotifyAuthButton';
export interface LandingLayoutProps {
  children: React.ReactNode;
  params: { slug: string }
}

// export async function generateStaticParams() {
//   const hosts = await getHosts();

//   return hosts.map((host) => ({
//     slug: host.shortName,
//   }));
// }

export default async function HostLayout({ children, params }: LandingLayoutProps) {
  // const nextCookies = cookies();
  // const token = nextCookies.get('spotify-token');
  // console.log(token);
  // const host = await getHost(params.slug);
  // if (!host) return notFound();

  return (
    <section>
      {/* <SpotifyAuthButton /> */}
      {children}
    </section>
  );
}
