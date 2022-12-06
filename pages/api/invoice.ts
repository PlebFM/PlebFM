import { NextApiRequest, NextApiResponse } from 'next';
import { Agent } from 'https';
import fetch from 'node-fetch';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    try {
        const headers = {
            'Grpc-Metadata-macaroon': process.env.INVOICE_MACAROON!,
        };
        const agent = {
            agent: new Agent({
                rejectUnauthorized: false,
            }),
        };
        if (req.method === 'POST') {
            const body = JSON.parse(req.body);
            const { value, memo } = body;
            if (!value) throw new Error('value is required');
            const url = `${process.env.LND_ENDPOINT}/v1/invoices`;
            const requestBody = {
                value,
                memo,
            };
            const response = await fetch(url, {
                method: 'POST',
                body: JSON.stringify(requestBody),
                headers,
                agent: new Agent({
                    rejectUnauthorized: false,
                }),
            });
            if (!response.ok) throw new Error('failed to create invoice');
            const data: any = await response.json();
            const invoice = {
                hash: Buffer.from(data.r_hash.toString(), 'base64').toString(
                    'hex'
                ),
                paymentRequest: data.payment_request,
            };
            res.status(200).json(invoice);
        } else if (req.method === 'GET') {
            const { hash } = req.query;
            if (!hash) throw new Error('hash is required');
            const url = `${process.env.LND_ENDPOINT}/v1/invoice/${hash}`;
            const response = await fetch(url, {
                method: 'GET',
                headers,
                agent: new Agent({
                    rejectUnauthorized: false,
                }),
            });
            if (!response.ok) throw new Error('failed to get invoice status');
            const data = await response.json();
            res.status(200).json(data);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
};

export default handler;
