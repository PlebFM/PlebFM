import { NextApiRequest, NextApiResponse } from "next";
import querystring from "querystring";
import connectDB from "../../../middleware/mongodb";
import Customers, { Customer } from '../../../models/Customer'

const handler = async(req: NextApiRequest, res: NextApiResponse) => {
  const { customerName } = req.query;
  // Gets list of customers
  if (req.method === 'GET') {
    const customer = await Customers.findOne({shortName: customerName});
    if (!customer)
      return res.status(400).json({success: false, error: 'Customer not found.'});

    return res.status(200).json({success: true, customer: customer});

  // Adds new customer
  } else if (req.method === 'POST') {
    const { customerName, shortName } = req.body;
    if (!customerName) res.status(400).json({error: `customerName must be present`});
    const customer: Customer = {
      customerName: customerName,
      shortName: shortName
    }
    const result = await Customers.create(customer);
    res.status(200).json({success: true, customer: result});
  }
}

export default connectDB(handler);