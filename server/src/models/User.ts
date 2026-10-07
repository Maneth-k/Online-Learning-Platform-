import { Schema, model, type Document, type Model } from 'mongoose';

export type UserRole = 'student' | 'instructor';

export interface IUser {
  username: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'instructor'],
        message: '{VALUE} is not a valid role (must be "student" or "instructor")',
      },
      required: [true, 'Role is required'],
      default: 'student',
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

// Indexes
userSchema.index({ username: 1 }, { unique: true });

export const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
export default User;
