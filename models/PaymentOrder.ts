import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true },
    requestKey: { type: String, required: true, unique: true },
    hostId: { type: String, required: true, index: true },
    shortName: { type: String, required: true },
    user: { type: Schema.Types.Mixed, required: true },
    song: { type: Schema.Types.Mixed, required: true },
    amountSats: { type: Number, required: true, min: 1 },
    currency: { type: String, default: 'SAT' },
    earnsRevenue: { type: Boolean, default: false },
    provider: { type: String, required: true },
    statusRef: { type: String },
    paymentHash: { type: String },
    paymentRequest: String,
    mintState: { type: String, default: 'creating' },
    state: { type: String, default: 'pending', index: true },
    reservationMonth: String,
    reservationReleased: { type: Boolean, default: false },
    checkedAt: Date,
    playId: String,
    paidAt: Date,
    notifiedAt: Date,
    netAmountSats: Number,
  },
  { timestamps: true },
);
schema.index(
  { provider: 1, paymentHash: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentHash: { $type: 'string' } },
  },
);
schema.index(
  { provider: 1, statusRef: 1 },
  { unique: true, partialFilterExpression: { statusRef: { $type: 'string' } } },
);
export default mongoose.models.PaymentOrder ||
  mongoose.model('PaymentOrder', schema);
