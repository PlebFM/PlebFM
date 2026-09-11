// import { Schema, model, models } from 'mongoose';
import mongoose, { Schema } from 'mongoose';

/**
 * Object created when a host signs up as a Host.
 * Represents a host who hosts a PlebFM jukebox instance.
 * @type Host
 * @field hostId: string - cuid of host object in db
 * @field hostName: string - full name of host
 * @field shortName: string - short name lookup of host
 * @field spotifyRefreshToken: string - token generated upon signup to get spotify auth
 */
export type Host = {
  deletedAt?: Date | null;
  accentColor?: string;
  welcomeMessage?: string;
  hostName?: string;
  shortName?: string;
  spotifyRefreshToken: string;
  spotifyId: string;
  hostId: string;
};

const HostSchema = new Schema<Host>({
  deletedAt: { type: Date, default: null },
  accentColor: { type: String, default: '#a855f7' },
  welcomeMessage: { type: String, default: '' },
  hostName: {
    type: String,
    unique: true,
    sparse: true,
  },
  shortName: {
    type: String,
    unique: true,
    sparse: true,
  },
  spotifyRefreshToken: {
    type: String,
    select: false,
  },
  spotifyId: {
    type: String,
    required: true,
  },
  hostId: {
    type: String,
    unique: true,
    required: true,
  },
});

const Hosts =
  mongoose.models['hosts-v3'] || mongoose.model('hosts-v3', HostSchema);
export default Hosts;
