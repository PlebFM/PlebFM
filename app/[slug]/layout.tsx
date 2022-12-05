import { Customer } from "../../models/Customer";
import notFound from "./not-found";
import { getCustomer, getCustomers } from '../../lib/customers';
import SearchBox from "./SearchBox";

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

  return (
    <section>
      <h1>hi</h1>
      <>{customer.customerName}</>
      <SearchBox />
      {children}
    </section>
  );
}
