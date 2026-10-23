import mongoose, { Schema, Document, Types } from 'mongoose';

export type UserRole = 'student' | 'moderator' | 'admin';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  college: Types.ObjectId;
  role: UserRole;
  isVerified: boolean;
  isOnboarded: boolean;
  department?: string;
  academicYear?: string;
  bio?: string;
  skills: string[];
  interests: string[];
  avatarUrl?: string;
  privacySettings: {
    profileVisibility: 'college' | 'public' | 'private';
    showEmail: boolean;
    allowDirectMessages: boolean;
  };
  blockedUsers: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, select: false },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    role: { type: String, enum: ['student', 'moderator', 'admin'], default: 'student', index: true },
    isVerified: { type: Boolean, default: false },
    isOnboarded: { type: Boolean, default: false },
    department: { type: String, trim: true },
    academicYear: { type: String, trim: true },
    bio: { type: String, maxlength: 500, trim: true },
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    avatarUrl: { type: String, default: '' },
    privacySettings: {
      profileVisibility: { type: String, enum: ['college', 'public', 'private'], default: 'college' },
      showEmail: { type: Boolean, default: false },
      allowDirectMessages: { type: Boolean, default: true },
    },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Indexes
UserSchema.index({ skills: 1 });
UserSchema.index({ college: 1, department: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
