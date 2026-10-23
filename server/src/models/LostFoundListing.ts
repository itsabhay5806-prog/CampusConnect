import mongoose, { Schema, Document, Types } from 'mongoose';

export type LostFoundType = 'lost' | 'found';
export type LostFoundStatus = 'open' | 'matched' | 'resolved';
export type LostFoundCategory = 'electronics' | 'id_cards' | 'keys' | 'books' | 'clothing' | 'other';

export interface ILostFoundListing extends Document {
  _id: Types.ObjectId;
  author: Types.ObjectId;
  college: Types.ObjectId;
  type: LostFoundType;
  title: string;
  description: string;
  category: LostFoundCategory;
  campusLocation: string;
  incidentDate: Date;
  imageUrl?: string;
  contactPreference: 'in_app_chat' | 'moderator_desk';
  status: LostFoundStatus;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LostFoundListingSchema = new Schema<ILostFoundListing>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    type: { type: String, enum: ['lost', 'found'], required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    category: {
      type: String,
      enum: ['electronics', 'id_cards', 'keys', 'books', 'clothing', 'other'],
      required: true,
      index: true,
    },
    campusLocation: { type: String, required: true, trim: true },
    incidentDate: { type: Date, required: true },
    imageUrl: { type: String },
    contactPreference: {
      type: String,
      enum: ['in_app_chat', 'moderator_desk'],
      default: 'in_app_chat',
    },
    status: {
      type: String,
      enum: ['open', 'matched', 'resolved'],
      default: 'open',
      index: true,
    },
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

LostFoundListingSchema.index({ college: 1, type: 1, status: 1 });

export const LostFoundListing = mongoose.model<ILostFoundListing>('LostFoundListing', LostFoundListingSchema);
