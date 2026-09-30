import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    hostId: { type: String, required: true, index: true },
    provider: { type: String, enum: ['mdk', 'stripe'], required: true },
    externalId: { type: String, required: true },
    customerId: String,
    planId: { type: String, required: true },
    status: { type: String, required: true },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: Boolean,
    checkedAt: Date,
  },
  { timestamps: true },
);
schema.index({ provider: 1, externalId: 1 }, { unique: true });
export default mongoose.models.HostSubscription ||
  mongoose.model('HostSubscription', schema);
