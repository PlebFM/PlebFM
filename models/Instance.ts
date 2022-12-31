import mongoose, { Schema } from 'mongoose';
import { Bid } from './Bid';

/**
 * @type Instance
 * @field id
 * @field customerId
 * @field songId
 * @field status
 * @field queueTimestamp
 * @field playedTimestamp
 * @field bids
 * @field runningTotal
 */
export type Instance = {
  id: string;
  customerId: string;
  songId: string;
  status: string;
  queueTimestamp: string;
  playedTimestamp: string | undefined;
  bids: Array<Bid>;
  runningTotal: number | 0;
}

const InstanceSchema = new Schema<Instance>({
  id: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
    type: String,
    unique: false,
    required: true,
  },
  songId: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    required: true
  },
  queueTimestamp: {
    type: String,
    unique: false,
    required: true,
  },
  playedTimestamp: {
    type: String,
    unique: false,
    required: false,
  },
  bids: {
    type: new Array<Bid>,
    unique: false,
    required: true,
  },
  runningTotal: {
    type: Number,
    unique: false,
    required: false,
  }
})

console.error(mongoose.models);
const Instances =
    mongoose.models.Instances || mongoose.model('Instances', InstanceSchema);
export default Instances;
