import mongoose, { Schema } from 'mongoose';
import { Bid } from './Bid';
/**
 * Object created when bid/submit route called.
 * Represents an instance of a song added to queue via a bid.
 * @type Play
 * @field playId: cuid of a play
 * @field hostId: cuid of a host
 * @field songId: spotify song uuid
 * @field status: song status in queue (queued | played | next)
 * @field queueTimestamp: datetime when play was created (i.e. bid submitted)
 * @field playedTimestamp: datetime when play was executed (i.e. song played)
 * @field bids: array of Bid objects
 * @field runningTotal: sum of all amounts in Bid Array
 */
export type Play = {
  playId: string;
  hostId: string;
  songId: string;
  status: string; // played, next, queued
  bids: Bid[];
  runningTotal: number | 0;
  queueTimestamp: string;
  playedTimestamp?: string;
  songLength: number; // seconds
  songName: string;
  songArtist: string;
  albumUri: string;
};

const PlaySchema = new Schema<Play>({
  playId: {
    type: String,
    unique: true,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  songId: {
    type: String,
    unique: true,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  bids: {
    type: new Array<Bid>(),
    index: -1,
    required: true,
  },
  runningTotal: {
    type: Number,
    index: -1,
    required: true,
  },
  queueTimestamp: {
    type: String,
    index: 1,
    required: true,
  },
  playedTimestamp: {
    type: String,
  },
  songName: {
    type: String,
    required: true,
  },
  songArtist: {
    type: String,
    required: true,
  },
  albumUri: {
    type: String,
    required: true,
  },
  songLength: {
    type: Number,
    required: true,
  },
});

const Plays = mongoose.models.Plays || mongoose.model('Plays', PlaySchema);
export default Plays;
