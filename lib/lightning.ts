import { createContext, useContext } from "react";

export class LightningStore {
  restEndpoint: string | undefined;
  invoiceMacaroon: string | undefined;

  constructor() { 
    console.log('constructed')
  }

  async initialize(restEndpoint: string, adminMacaroon: string) {
    this.restEndpoint = process.env.LND_ENDPOINT;
    this.invoiceMacaroon = process.env.INVOICE_MACAROON;
  };

  async requestInvoice(amount: number, memo: string): Promise<string>  {
    console.log('invoice: lnbc...');
    return 'lnbcasdfksjdf';
  }

  async checkInvoiceStatus(paymentRequest: string): Promise<string>  {
    console.log('invoice paid!');
    return 'invoice paid!';
  }

}

export const LightningStoreContext = createContext<LightningStore>(new LightningStore());
export const useLightning = () => useContext(LightningStoreContext);