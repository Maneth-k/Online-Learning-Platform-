import bcrypt from 'bcrypt';
import { Schema, model, type Document, type Model } from 'mongoose';

export type UserRole = 'student' | 'instructor';

export interface IUser {
  email: string;
  username?: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
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
        if (!ret.email && ret.username) {
          ret.email = ret.username;
        }
        if (!ret.username && ret.email) {
          ret.username = ret.email;
        }
        return ret;
      },
    },
    toObject: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret.password;
        if (!ret.email && ret.username) {
          ret.email = ret.username;
        }
        if (!ret.username && ret.email) {
          ret.username = ret.email;
        }
        return ret;
      },
    },
  }
);

// Fallback pre-validation hook to ensure email and username are synchronized
userSchema.pre('validate', function () {
  if (!this.email && this.username) {
    this.email = this.username.includes('@')
      ? this.username.toLowerCase()
      : `${this.username.toLowerCase()}@mentora.edu`;
  }
  if (!this.username && this.email) {
    this.username = this.email;
  }
});

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method for authentication
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};


export const User: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
export default User;

