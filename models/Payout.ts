import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    requestKey: { type: String, required: true, unique: true },
    hostId: { type: String, required: true, index: true },
    amountSats: { type: Number, required: true, min: 1 },
    destination: { type: String, required: true },
    state: { type: String, default: 'reserved' },
    paymentId: String,
    completedAt: Date,
  },
  { timestamps: true },
);
export default mongoose.models.Payout || mongoose.model('Payout', schema);
