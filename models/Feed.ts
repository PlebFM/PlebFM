import mongoose, { Schema } from 'mongoose';

export type Update = {
  type: string;
  hostId: string;
  userId: string;
  songId: string | null;
  timestamp: string;
};

const FeedSchema = new Schema<Update>({
  type: {
    type: String,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  songId: {
    type: String,
  },
  timestamp: {
    type: String,
    required: true,
  },
});

const Feed = mongoose.models.Feed || mongoose.model('feed', FeedSchema);
export default Feed;
