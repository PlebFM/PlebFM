import { notFound } from "next/navigation";
import { Customer } from "../models/Host";

export const getCustomers = async (): Promise<Customer[]> => {
  const res = await fetch("http://localhost:3000/api/customers", {
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

export const getCustomer = async (slug: string): Promise<Customer> => {
  const res = await fetch(`http://localhost:3000/api/customers/${slug}`, {
    method: 'GET',
    mode: 'no-cors',
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });
  if (!res.ok) {
    if (res.status === 400) return null;
    throw new Error('unable to fetch data');
  }
  const customer = await res.json();
  return customer.customer;
}