import mongoose, { Schema } from 'mongoose';

export enum Colors {
    PurpleLight = 'purpleLight',
    Purple = 'purple',
    PurpleDark = 'purpleDark',
    OrangeLight = 'orangeLight',
    Orange = 'orange',
    OrangeDark = 'orangeDark',
    TealLight = 'tealLight',
    Teal = 'teal',
    TealDark = 'tealDark',
}

export enum Adjectives {
    Fluffy = 'Fluffy',
    Based = 'Based',
    Insidious = 'Insidious',
    Zazzy = 'Zazzy',
    Silent = 'Silent',
    Squealing = 'Squealing',
    Wonderful = 'Wonderful',
    Helpful = 'Helpful',
}

export enum Characters {
    Honeybadger = 'Honeybadger',
    Kitty = 'Kitty',
    Fawkes = 'Fawkes',
    Bankasaurus = 'Bankasaurus',
    Goldbug = 'Goldbug',
    Chaditha = 'Chaditha',
}

export type User = {
    userId: string;
    firstNym: string;
    lastNym: string;
    avatar: string;
};

export const randomEnumValue = (enumeration: any) => {
    const values = Object.keys(enumeration);
    const enumKey = values[Math.floor(Math.random() * values.length)];
    return enumeration[enumKey];
};

const UserSchema = new Schema<User>({
    userId: {
        type: String,
        unique: true,
        required: true,
    },
    firstNym: {
        type: String,
        required: true,
    },
    lastNym: {
        type: String,
        required: true,
    },
    avatar: {
        type: String,
        required: true,
    },
});

const Users = mongoose.models.Users || mongoose.model('Users', UserSchema);
export default Users;
