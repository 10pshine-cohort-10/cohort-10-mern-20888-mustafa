import { Schema, model } from 'mongoose';

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: [/^[A-Za-z0-9_]+$/, 'Username can only use letters, numbers and underscores'],
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true },
);

// usernames are unique no matter how they are capitalised
userSchema.index({ username: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

export const User = model<IUser>('User', userSchema);
