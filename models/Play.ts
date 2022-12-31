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
    status: string;
    queueTimestamp: string;
    playedTimestamp?: string;
    bids: Array<Bid>;
    runningTotal: number | 0;
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
    queueTimestamp: {
        type: String,
        required: true,
    },
    playedTimestamp: {
        type: String,
    },
    bids: {
        type: new Array<Bid>(),
        required: true,
    },
    runningTotal: {
        type: Number,
    },
});

const Plays = mongoose.models.Plays || mongoose.model('Plays', PlaySchema);
export default Plays;
