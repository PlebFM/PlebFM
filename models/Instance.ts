import mongoose, { Schema } from 'mongoose';
import { Bid } from './Bid';

/**
 * @type Instance
 * @field songId
 * @field customerId
 * @field status
 * @field queueTimestamp
 * @field playedTimestamp
 * @field bids
 */
export type Instance = {
  customerId: string;
  songId: string;
  status: string;
  queueTimestamp: string;
  playedTimestamp: string | undefined;
  bids: Array<Bid>;
  runningTotal: number;
}

const InstanceSchema = new Schema<Instance>({
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
  },
  bids: {
    type: new Array<Bid>,
    unique: false,
    required: true,
  },
  runningTotal: {
    type: Number,
    unique: false,
  }
})

console.error(mongoose.models);
const Instances = mongoose.models.Instances || mongoose.model('Instances', InstanceSchema);
export default Instances;
