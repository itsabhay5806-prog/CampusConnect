import mongoose, { Schema, Document, Types } from 'mongoose';

export type PostCategory = 'announcement' | 'event' | 'academic' | 'general';

export interface IPost extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  college: Types.ObjectId;
  title?: string;
  content: string;
  category: PostCategory;
  images: string[];
  tags: string[];
  likesCount: number;
  commentsCount: number;
  pinned: boolean;
  isReported: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    title: { type: String, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000, trim: true },
    category: {
      type: String,
      enum: ['announcement', 'event', 'academic', 'general'],
      default: 'general',
      index: true,
    },
    images: { type: [String], default: [] },
    tags: { type: [String], default: [] },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    pinned: { type: Boolean, default: false },
    isReported: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

PostSchema.index({ college: 1, createdAt: -1 });
PostSchema.index({ college: 1, category: 1, createdAt: -1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
