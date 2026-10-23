import mongoose, { Schema, Document, Types } from 'mongoose';

export type ReportTargetType = 'post' | 'comment' | 'resource' | 'lost_found' | 'project' | 'user';
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'impersonation'
  | 'inappropriate'
  | 'fraud'
  | 'copyright'
  | 'other';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporter: Types.ObjectId;
  college: Types.ObjectId;
  targetType: ReportTargetType;
  targetId: Types.ObjectId;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  reviewedBy?: Types.ObjectId;
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    targetType: {
      type: String,
      enum: ['post', 'comment', 'resource', 'lost_found', 'project', 'user'],
      required: true,
      index: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'impersonation', 'inappropriate', 'fraud', 'copyright', 'other'],
      required: true,
      index: true,
    },
    details: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    moderatorNotes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

ReportSchema.index({ college: 1, status: 1, createdAt: -1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
