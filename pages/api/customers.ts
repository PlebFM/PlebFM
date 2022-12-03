import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";
import connectDB from "../../middleware/mongodb";
import Customer, { CustomerRef } from '../../models/Customer'

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of clients
  if (req.method === 'GET') {
    const clients = await Customer.find();
    res.status(200).json({success: true, customers: clients});

  // Adds new customer
  } else if (req.method === 'POST') {
    const { publicName } = req.body;
    if (!publicName) res.status(400).json({error: `publicName must be present`});
    const customer: CustomerRef = {
      publicName: publicName,
    }
    const result = await Customer.create(customer);
    res.status(200).json({success: true, customer: result});
  }
}

export default connectDB(handler);