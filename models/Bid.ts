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
  bidAmount: string, // slug
  timestamp: string,
  rHash: string
}
const BidSchema = new Schema<Bid>({
  userId: {
    type: String, // slug
    unique: false,
    required: true,
  },
  bidAmount: {
    type: String, // slug
    unique: true,
    required: true,
  },
  timestamp: {
    type: String,
    required: true
  }
})

console.error(mongoose.models);
const Bids = mongoose.models.Bids || mongoose.model('Bids', BidSchema);
export default Bids;
