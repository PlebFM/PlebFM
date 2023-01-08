import { Schema } from 'mongoose';

export type Song = {
  duration_ms: number;
  album: { images: { url: string }[]; name: string };
  name: string;
  artists: { name: string }[];
  id: string;
};

const SongSchema = new Schema<Song>({
  duration_ms: {
    type: Number,
    required: true,
  },
  album: {
    type: Object,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  artists: {
    type: new Array(),
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
});

export default SongSchema;
