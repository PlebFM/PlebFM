import mongoose, { Schema } from 'mongoose';

export type User = {
    userId: string;
    firstNym: string;
    lastNym: string;
    refreshToken: string;
    avatar: string;
};

const UserSchema = new Schema<User>({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    firstNym: {
        type: String,
        unique: true,
        required: true,
    },
    lastNym: {
        type: String,
        unique: true,
        required: true,
    },
    refreshToken: {
        type: String,
        unique: true,
        required: true,
    },
    avatar: {
        type: String,
        unique: true,
        required: true,
    },
});

const Users = mongoose.models.Users || mongoose.model('Users', UserSchema);
export default Users;
