import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middleware/mongodb";
import Customers, { Customer } from '../../../models/Customer'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { shortName } = req.query;
    // Gets list of customers
    if (req.method === 'GET') {
      const customer = await Customers.findOne({ shortName: shortName });
      if (!customer)
        return res.status(400).json({ success: false, error: 'Customer not found.' });

      return res.status(200).json({ success: true, customer: customer });

      // Adds new customer
    } else if (req.method === 'POST') {
      const { customerName, shortName, customerId, refreshToken } = req.body;
      if (!customerName) res.status(400).json({ error: `customerName must be present` });
      const customer: Customer = {
        customerName: customerName,
        shortName: shortName,
        id: customerId,
        spotifyRefreshToken: refreshToken
      }
      const result = await Customers.create(customer);
      res.status(200).json({ success: true, customer: result });
    }
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, error: 'customer lookup failed' });
  }
};

export default connectDB(handler);