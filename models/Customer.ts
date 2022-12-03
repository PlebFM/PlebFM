import { Schema, models, model } from 'mongoose';

export type CustomerRef = {
  publicName: string, // slug
}
const CustomerSchema = new Schema<CustomerRef>({
  publicName: String, // slug
})

const Customer = models.Customer || model('Customer', CustomerSchema);
export default Customer;
