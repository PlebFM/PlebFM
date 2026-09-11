import mongoose, { Schema } from 'mongoose';
const schema = new Schema({
  _id: String,
  queueLeaseUntil: Date,
  queueLeaseId: String,
  balanceSats: { type: Number, default: 0, min: 0 },
  earnedSats: { type: Number, default: 0 },
  receivedSats: { type: Number, default: 0 },
  revision: { type: Number, default: 0 },
  month: String,
  songCount: { type: Number, default: 0 },
});
export default mongoose.models.HostAccount ||
  mongoose.model('HostAccount', schema);
