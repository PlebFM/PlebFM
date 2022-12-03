const createBolt11 = async (value: number, memo: string) => {
    // TODO
    // POST request /v1/invoices
    const url = `${process.env.LND_ENDPOINT}/v1/invoices`;
    const requestBody = {
        value,
        memo,
    };
    const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Grpc-Metadata-macaroon': process.env.INVOICE_MACAROON },
    });
    const paymentRequest = await response.json();
    return paymentRequest;
};

const checkInvoiceStatus = () => {
    // TODO
};

export { createBolt11, checkInvoiceStatus };
