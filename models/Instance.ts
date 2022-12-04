import mongoose, { Schema } from 'mongoose';
import { Bid } from './Bid';

/**
 * @type Instance
 * @field songId
 * @field customerId
 * @field status
 * @field queueTimestamp
 * @field playedTimestamp
 * @field Bids
 */
export type Instance = {
  customerId: string,
  songId: string,
  status: string,
  queueTimestamp: string
  playedTimestamp: string
  Bids: object
}

const InstanceSchema = new Schema<Instance>({
  songId: {
    type: String,
    unique: true,
    required: true,
  },
  customerId: {
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
    required: true
  },
  Bids: {
    type: Array<Bid>,
    unique: false,
    required: true,
  }
})

console.error(mongoose.models);
const Instances = mongoose.models.Instances || mongoose.model('Instances', InstanceSchema);
export default Instances;
