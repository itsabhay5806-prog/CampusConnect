import mongoose, { Schema, Document, Types } from 'mongoose';

export type CommunityMemberRole = 'admin' | 'moderator' | 'member';

export interface ICommunityMembership extends Document {
  community: Types.ObjectId;
  user: Types.ObjectId;
  role: CommunityMemberRole;
  joinedAt: Date;
}

const CommunityMembershipSchema = new Schema<ICommunityMembership>(
  {
    community: { type: Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: 'joinedAt', updatedAt: false } }
);

CommunityMembershipSchema.index({ community: 1, user: 1 }, { unique: true });

export const CommunityMembership = mongoose.model<ICommunityMembership>('CommunityMembership', CommunityMembershipSchema);
