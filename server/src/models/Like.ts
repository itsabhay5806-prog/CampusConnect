import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILike extends Document {
  user: Types.ObjectId;
  post: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

LikeSchema.index({ user: 1, post: 1 }, { unique: true });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
