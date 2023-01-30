import { Schema } from 'mongoose';
import { Update } from '../Updates';

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
    type: Object,
  },
  host: {
    type: Object,
  },
  user: {
    type: Object,
  },
  timestamp: {
    type: String,
    required: true,
    unique: true,
  },
});

export default UpdateSchema;
