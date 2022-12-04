import mongoose, { Schema } from 'mongoose';
import { Bid } from './Bid'

/**
 * @type Instance
 * @field songId
 * @field customerId
 * @field status
 * @field queueTimestamp
 * @field playedTimestamp
 * @field Bids
 * 
 */
export type Instance = {
  songId: string,
  customerId: string,
  status: string,
  queueTimestamp: string
  playedTimestamp: string
  Bids: ArrayLike<Bid>
}

const InstanceSchema = new Schema<Instance>({
  songId: {
    type: String,
    unique: false,
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
