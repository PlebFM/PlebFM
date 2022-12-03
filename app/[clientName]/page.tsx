// pleb.fm/shiners
// Bidding landing page

import { postcss } from "autoprefixer";
import { Customer } from "../../models/Customer";
import SearchBox from "./SearchBox";

type Props = {
  params: {
    clientName: string
  }
}

const getClients = async (): Promise<Customer[]> => {

}

export default function Bidding({ params }: {params: {clientName: string}}) {
  const { clientName } = params;
  console.log('hererher', clientName);

  return (
    <>
      <h1>Hello World! Bidding landing page</h1>
      <SearchBox />
    </>
  );
}

export async function generateStaticParams() {
  const clients: Customer[] = await getClients();

  return clients.map((client: Customer) => {
    clientName: client.publicName;
  })
}
