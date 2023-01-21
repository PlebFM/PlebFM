import { Schema } from 'mongoose';

/**
 * Object created when bid/submit route called.
 * Represents an instance of a bid to be added to the Bid array in the Play object.
 * @type Bid
 * @field bidId: string - cuid of a bid object in DB
 * @field userId: User - cuid of a user object in DB
 * @field bidAmount: number - amount (in SATs) of a bid
 * @field timestamp: string - timestamp the bid was submitted / created
 * @field rHash: string - r_hash of a LN invoice
 */
export type Bid = {
  bidId: string;
  userId: string;
  bidAmount: number;
  timestamp: string;
  rHash: string;
};

const BidSchema = new Schema<Bid>({
  bidId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: String,
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
    required: true,
  },
  rHash: {
    type: String,
    unique: true,
    required: true,
  },
});

export default BidSchema;
