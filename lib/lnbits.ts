import fetch from 'node-fetch';
export type ScanResult =
  | {
      status: string;
      callback: string;
      description: string;
      description_hash: string;
      minSendable: number;
      maxSendable: number;
    }
  | { error: string; status: string };
export const readLnurl = async (lnurl: string): Promise<ScanResult> => {
  const url = `${process.env.LNBITS_URL!}/api/v1/lnurlscan/${lnurl}`;
  const data = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LNBITS_API_KEY!,
    },
  });
  if (data.status !== 200) {
    console.error('data', await data.json());
    return { error: data.statusText, status: 'failed' };
  }
  const rawResult = (await data.json()) as ScanResult;
  return rawResult;
};

// Pays the lnurl and returns the result
export const pay = async (lnAddress: string, jackpot: number) => {
  const url = `${process.env.LNBITS_URL!}/api/v1/payments/lnurl`;
  const lnurlData: ScanResult = await readLnurl(lnAddress);
  if (lnurlData.status !== 'OK' || 'error' in lnurlData) {
    return { status: 'failed', error: lnurlData.status };
  }
  const amount = jackpot;
  const body = {
    amount: amount * 1000, // millisatoshis
    callback: lnurlData.callback,
    comment: `Congraturations! You've won ${amount} satoshis from LastPayWins!`,
    description: lnurlData.description,
    description_hash: lnurlData.description_hash,
  };

  const data = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LNBITS_API_KEY_ADMIN!,
    },
    body: JSON.stringify(body),
  });
  if (data.status !== 200) {
    return { status: 'failed', error: await data.json() };
  }
  const rawResult = await data.json();
  return rawResult;
};

export const checkLnbitsInvoice = async (paymentHash: string) => {
  const url = `${process.env.LNBITS_URL!}/api/v1/payments/${paymentHash}`;
  const rawData = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LNBITS_API_KEY_ADMIN!,
    },
  });
  const data = await rawData.json();
  return data;
};

export const getLnbitsInvoice = async (memo: string, amount: number) => {
  // const amount = process.env.INVOICE_AMOUNT || 1000;
  const url = `${process.env.LNBITS_URL!}/api/v1/payments`;
  const body = {
    out: false,
    amount: amount, // Sats
    memo: memo,
    expiry: 3600,
    unit: 'sat',
  };

  const rawData = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.LNBITS_API_KEY_ADMIN!,
    },
    body: JSON.stringify(body),
  });
  const data = await rawData.json();
  return data;
};
