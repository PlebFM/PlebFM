import { notFound } from 'next/navigation';
import NavBar from '../../components/NavBar';
import { getCustomer, getCustomers } from '../../lib/customers';
export interface LandingLayoutProps {
  children: React.ReactNode;
  params: { slug: string }
}

export async function generateStaticParams() {
  const customers = await getCustomers();

  return customers.map((customer) => ({
    slug: customer.shortName,
  }));
}

export default async function LandingLayout({ children, params }: LandingLayoutProps) {
  const customer = await getCustomer(params.slug);
  if (!customer) return notFound();

  return (
    <section>
      {children}
    </section>
  );
}
