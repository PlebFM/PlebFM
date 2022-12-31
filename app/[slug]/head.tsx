import { Customer } from "../../models/Host";
import notFound from "../../app/[slug]/not-found";

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

export default async function Head({ params }: { params: { slug: string } }) {
  const customer = await getCustomer(params.slug);
  const fullTitle = `PlebFM - ${customer?.customerName ?? 'not found'}`
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1"  />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}