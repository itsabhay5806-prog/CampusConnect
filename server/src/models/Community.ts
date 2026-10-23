import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICommunity extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  college?: Types.ObjectId;
  creator: Types.ObjectId;
  avatarUrl?: string;
  bannerUrl?: string;
  rules: string[];
  memberCount: number;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    category: { type: String, required: true, trim: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', index: true },
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    avatarUrl: { type: String, default: '' },
    bannerUrl: { type: String, default: '' },
    rules: { type: [String], default: [] },
    memberCount: { type: Number, default: 0 },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommunitySchema.index({ college: 1, category: 1 });

export const Community = mongoose.model<ICommunity>('Community', CommunitySchema);
