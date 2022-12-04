import { NextApiRequest, NextApiResponse } from "next";
import connectDB from "../../../middleware/mongodb";
import Customers, { Customer } from '../../../models/Customer'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { customerName } = req.query;
  // Gets list of customers
  if (req.method === 'GET') {
    const customer = await Customers.findOne({shortName: customerName});
    if (!customer)
      return res.status(400).json({success: false, error: 'Customer not found.'});

    return res.status(200).json({success: true, customer: customer});
  }
};

export default connectDB(handler);