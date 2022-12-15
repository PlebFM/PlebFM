import mongoose, { Schema } from 'mongoose';
import { User } from './User';

/**
 * @type Bid
 * @field userId
 * @field bidAmount
 * @field timestamp
 * @field rHash
 */
export type Bid = {
  user: User;
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
