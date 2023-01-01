import { notFound } from 'next/navigation';
import NavBar from '../../components/NavBar';
import { getHost, getHosts } from '../../lib/hosts';
export interface LandingLayoutProps {
  children: React.ReactNode;
  params: { slug: string }
}

export async function generateStaticParams() {
  const hosts = await getHosts();

  return hosts.map((host) => ({
    slug: host.shortName,
  }));
}

export default async function LandingLayout({ children, params }: LandingLayoutProps) {
  const host = await getHost(params.slug);
  if (!host) return notFound();

  return (
    <section>
      {children}
    </section>
  );
}
