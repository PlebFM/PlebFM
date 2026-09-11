import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    requestKey: { type: String, required: true, unique: true },
    hostId: { type: String, required: true, index: true },
    planId: String,
    checkoutId: { type: String, unique: true, sparse: true },
    state: { type: String, default: 'creating' },
    amount: Number,
    currency: String,
    paidAt: Date,
  },
  { timestamps: true },
);
schema.index(
  { hostId: 1 },
  {
    unique: true,
    name: 'one_pending_checkout_per_host',
    partialFilterExpression: {
      state: { $in: ['creating', 'pending', 'uncertain'] },
    },
  },
);
export default mongoose.models.BillingCheckout ||
  mongoose.model('BillingCheckout', schema);
