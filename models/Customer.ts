import { Schema, models, model } from 'mongoose';

export type Customer = {
  customerName: string, // slug
}
const CustomerSchema = new Schema<Customer>({
  customerName: String, // slug
})

// console.error(models.Customers.find({}));
console.error(models);
console.error(models.Customers);

const Customers = models.Customers || model('Customers', CustomerSchema);
export default Customers;
