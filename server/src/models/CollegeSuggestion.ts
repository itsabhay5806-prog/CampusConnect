import mongoose, { Schema, Document, Types } from 'mongoose';

export type SuggestionStatus = 'pending' | 'reviewed' | 'approved' | 'rejected';

export interface ICollegeSuggestion extends Document {
  _id: Types.ObjectId;
  name: string;
  city: string;
  district?: string;
  state: string;
  website?: string;
  domain?: string;
  submitterEmail: string;
  status: SuggestionStatus;
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSuggestionSchema = new Schema<ICollegeSuggestion>(
  {
    name: { type: String, required: true, trim: true, maxlength: 180 },
    city: { type: String, required: true, trim: true, maxlength: 100 },
    district: { type: String, trim: true, maxlength: 100 },
    state: { type: String, required: true, trim: true, default: 'Uttar Pradesh', maxlength: 100 },
    website: { type: String, trim: true, maxlength: 250 },
    domain: { type: String, trim: true, lowercase: true, maxlength: 120 },
    submitterEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 150 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    adminNotes: { type: String, trim: true, maxlength: 500 },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CollegeSuggestionSchema.index({ submitterEmail: 1, status: 1 });
CollegeSuggestionSchema.index({ domain: 1 });
CollegeSuggestionSchema.index({ name: 1, city: 1 });

export const CollegeSuggestion = mongoose.model<ICollegeSuggestion>(
  'CollegeSuggestion',
  CollegeSuggestionSchema
);
