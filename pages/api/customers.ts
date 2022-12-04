import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";
import connectDB from "../../middleware/mongodb";
import Customers, { Customer } from '../../models/Customer'

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
  // Gets list of customers
  if (req.method === 'GET') {
    const customers = await Customers.find();
    res.status(200).json({success: true, customers: customers});

  // Adds new customer
  } else if (req.method === 'POST') {
    const { customerName, shortName } = req.body;
    if (!customerName) res.status(400).json({error: `customerName must be present`});
    const customer: Customer= {
      customerName: customerName,
      shortName: shortName
    }
    const result = await Customers.create(customer);
    res.status(200).json({success: true, customer: result});
  }
}

export default connectDB(handler);