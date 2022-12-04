import mongoose, { Schema } from 'mongoose';

export type Customer = {
  id: string,
  customerName: string,
  shortName: string, // slug
  spotifyRefreshToken: string
}

const CustomerSchema = new Schema<Customer>({
  id: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    unique: false,
    required: true,
  },
  shortName: {
    type: String,
    unique: true,
    required: true,
  },
  spotifyRefreshToken: {
    type: String,
    required: true
  }
})

console.error(mongoose.models);
const Customers = mongoose.models.Customers || mongoose.model('Customers', CustomerSchema);
export default Customers;
