import mongoose, { Schema } from 'mongoose';

/**
 * Object created when a host signs up as a Host.
 * Represents a host who hosts a PlebFM jukebox instance.
 * @type Host
 * @field hostId: string - cuid of host object in db
 * @field hostName: string - full name of host
 * @field shortName: string - short name lookup of host
 * @field spotifyRefreshToken: string - token generated upon signup to get spotify a
 */
export type Host = {
  hostId: string,
  hostName: string,
  shortName: string,
  spotifyRefreshToken: string
}

const HostSchema = new Schema<Host>({
  hostId: {
    type: String,
    unique: true,
    required: true
  },
  hostName: {
    type: String,
    unique: false,
    required: true,
  },
  shortName: {
    type: String,
    unique: true,
    required: true,
  },
  spotifyRefreshToken: {
    type: String,
    unique: true,
    required: false
  }
})

const Hosts = mongoose.models.Hosts || mongoose.model('Hosts', HostSchema);
export default Hosts;
