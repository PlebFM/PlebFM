import mongoose, { Schema } from 'mongoose';

type HostSettings = {
  backupPlaylist?: {
    id: string;
    url: string;
  };
  bannedSongsPlaylist?: {
    id: string;
    url: string;
  };
};

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
  hostName?: string;
  shortName?: string;
  spotifyRefreshToken: string;
  spotifyId: string;
  hostId: string;
  settings?: HostSettings;
};

const HostSchema = new Schema<Host>({
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
    unique: true,
    required: true,
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
  settings: {
    type: {
      backupPlaylist: {
        id: String,
        url: String,
      },
      bannedSongsPlaylist: {
        id: String,
        url: String,
      },
    },
    required: false,
  },
});

const Hosts =
  mongoose.models['hosts-v3'] || mongoose.model('hosts-v3', HostSchema);
export default Hosts;
