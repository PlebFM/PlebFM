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
const getCustomer = async (customerName: string): Promise<Customer> => {
  const res = await fetch(`http://0.0.0.0:3000/api/customer/${customerName}`, {
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

export default async function Bidding({ params }: {params: {customerName: string}}) {
  const { customerName } = params;
  const customer = await getCustomer(customerName);

  return (
    <>
      <h1>Hello World! Bidding landing page</h1>
      <SearchBox />
    </>
  );
}

export async function generateStaticParams() {
  const customers: Customer[] = await getCustomers();
  console.error(customers);
  // return customers;

  return customers.map((customer: Customer) => {
    return { customerName: customer.customerName };
  });
}

