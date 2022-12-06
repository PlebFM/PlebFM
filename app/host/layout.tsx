import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { getCustomer, getCustomers } from '../../lib/customers';
import SpotifyAuthButton from './SpotifyAuthButton';
export interface LandingLayoutProps {
  children: React.ReactNode;
  params: { slug: string }
}

// export async function generateStaticParams() {
//   const customers = await getCustomers();

//   return customers.map((customer) => ({
//     slug: customer.shortName,
//   }));
// }

export default async function HostLayout({ children, params }: LandingLayoutProps) {
  // const nextCookies = cookies();
  // const token = nextCookies.get('spotify-token');
  // console.log(token);
  // const customer = await getCustomer(params.slug);
  // if (!customer) return notFound();

  return (
    <section>
      {/* <SpotifyAuthButton /> */}
      {children}
    </section>
  );
}
