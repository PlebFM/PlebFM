import mongoose, { Schema } from 'mongoose';

/**
 * @type Bid
 * @field userId
 * @field bidAmount
 * @field timestamp
 * @field rHash
 */
export type Bid = {
  userId: string,
  bidAmount: string,
  timestamp: string,
  rHash: string
}
const BidSchema = new Schema<Bid>({
  userId: {
    type: String,
    unique: false,
    required: true,
  },
  bidAmount: {
    type: String,
    unique: false,
    required: true,
  },
  timestamp: {
    type: String,
    unique: true,
    required: true
  },
  rHash: {
    type: String,
    unique: true,
    required: true
  }
})

console.error(mongoose.models);
export default BidSchema;
