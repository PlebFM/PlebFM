import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    receiptId: { type: String, required: true, unique: true },
    hostId: { type: String, required: true, index: true },
    provider: String,
    planId: String,
    amount: Number,
    currency: String,
    paidAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.BillingReceipt ||
  mongoose.model('BillingReceipt', schema);
