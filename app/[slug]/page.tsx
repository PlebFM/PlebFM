// pleb.fm/shiners
// Bidding landing page


import { Customer } from "../../models/Customer";
import { notFound } from "next/navigation";
import SearchBox from "./SearchBox";

type Props = { params: {
    customerName: string
  }
}

const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch("http://0.0.0.0:3000/api/customers", {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) throw new Error('unable to fetch data');
  const customers = await res.json();
  return customers.customers;
}
const getCustomer = async (slug: string): Promise<Customer> => {
  const res = await fetch(`http://0.0.0.0:3000/api/customers/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) notFound();
  const customer = await res.json();
  return customer.customer;
}

export default async function Bidding({ params }: {params: {slug: string}}) {
  const { slug } = params;
  const customer = await getCustomer(slug);
  return (
    <div>
      <h1>Hello World! Bidding landing page for {customer.customerName} jukebox</h1>
      <SearchBox />
    </div>
  );
}

export async function generateStaticParams() {
  const customers: Customer[] = await getCustomers();
  console.error(customers);
  // return customers;

  return customers.map((customer: Customer) => {
    return { slug: customer.shortName };
  });
}

