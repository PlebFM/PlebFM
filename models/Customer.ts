import mongoose, { Schema } from 'mongoose';

export type Customer = {
  customerName: string, // slug
}
const CustomerSchema = new Schema<Customer>({
  customerName: String, // slug
})

console.error(mongoose.models);
const Customers = mongoose.models.Customers || mongoose.model('Customers', CustomerSchema);
export default Customers;
