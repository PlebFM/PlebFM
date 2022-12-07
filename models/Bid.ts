import mongoose, { Schema } from 'mongoose';

/**
 * @type Bid
 * @field userId
 * @field bidAmount
 * @field timestamp
 * @field rHash
 */
export type Bid = {
  user: object;
  bidAmount: number;
  timestamp: string;
  rHash: string;
}

const BidSchema = new Schema<Bid>({
  user: {
    type: Object,
    unique: false,
    required: true,
  },
  bidAmount: {
    type: Number,
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
