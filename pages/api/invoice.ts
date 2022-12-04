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
        // const agent = { agent: new Agent({ rejectUnauthorized: false }) };
        if (req.method === 'POST') {
            const { value, memo } = req.query;
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
            const data = await response.json();
            console.log('data: ', data);
            res.status(200).json(data);
        } else if (req.method === 'GET') {
            const { hash } = req.query;
            if (!hash) throw new Error('hash is required');
            const hashHex = Buffer.from(hash.toString(), 'base64').toString(
                'hex'
            );
            const url = `${process.env.LND_ENDPOINT}/v1/invoice/${hashHex}`;
            console.log('url: ', url);
            const response = await fetch(url, {
                method: 'GET',
                headers,
                agent: new Agent({
                    rejectUnauthorized: false,
                }),
            });
            if (!response.ok) throw new Error('failed to get invoice status');
            const data = await response.json();
            console.log('data: ', data);
            res.status(200).json(data);
        }
    } catch (e: any) {
        console.error(e.message);
        res.status(500).json(e.message);
    }
};

export default handler;
