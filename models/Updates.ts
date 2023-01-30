import mongoose from 'mongoose';
import UpdateSchema from './Schemas/UpdateSchema';
import Host from './Host';
import Play from './Play';
import User from './User';

export type Update = {
  type: string;
  delivered: Boolean;
  play: typeof Play;
  host: typeof Host;
  user: typeof User;
  timestamp: string;
};

const Updates =
  mongoose.models.Updates || mongoose.model('updates', UpdateSchema);
export default Updates;
