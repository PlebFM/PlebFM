import UserSchema from './User';

/**
 * Object created when bid/submit route called.
 * Represents an instance of a bid to be added to the Bid array in the Play object.
 * @type Bid
 * @field bidId: string - cuid of a bid object in DB
 * @field user: User object
 * @field bidAmount: number - amount (in SATs) of a bid
 * @field timestamp: string - timestamp the bid was submitted / created
 * @field rHash: string - r_hash of a LN invoice
 */
export type Bid = {
  bidId: string;
  user: typeof UserSchema;
  bidAmount: number;
  timestamp: string;
  rHash: string;
};
