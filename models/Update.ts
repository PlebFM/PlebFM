import mongoose, { Schema } from 'mongoose';
import HostSchema from './Host';
import PlaySchema from './Play';
import UserSchema from './User';

export type Update = {
  type: string;
  delivered: Boolean;
  play: typeof PlaySchema;
  host: typeof HostSchema;
  user: typeof UserSchema;
  timestamp: string;
};

const UpdateSchema = new Schema<Update>({
  type: {
    type: String,
    required: true,
  },
  delivered: {
    type: Boolean,
    required: true,
  },
  play: {
    type: PlaySchema,
  },
  host: {
    type: HostSchema,
  },
  user: {
    type: UserSchema,
  },
  timestamp: {
    type: String,
    required: true,
    unique: true,
  },
});

const Updates =
  mongoose.models.Updates || mongoose.model('updates', UpdateSchema);
export default Updates;
