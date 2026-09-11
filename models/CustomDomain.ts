import mongoose, { Schema } from 'mongoose';
const schema = new Schema(
  {
    hostId: { type: String, required: true, unique: true },
    domain: { type: String, required: true, unique: true },
    verified: { type: Boolean, default: false },
    verification: { type: Schema.Types.Mixed },
    dns: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);
export default mongoose.models.CustomDomain ||
  mongoose.model('CustomDomain', schema);
