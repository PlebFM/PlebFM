import mongoose, { Schema } from 'mongoose';

export type Customer = {
  customerName: string, 
  shortName: string, // slug
}
const CustomerSchema = new Schema<Customer>({
  customerName: {
    type: String, // slug
    unique: false,
    required: true,
  },
  shortName: {
    type: String, // slug
    unique: true,
    required: true,
  }
})

console.error(mongoose.models);
const Customers = mongoose.models.Customers || mongoose.model('Customers', CustomerSchema);
export default Customers;
