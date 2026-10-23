import mongoose, { Schema, Document, Types } from 'mongoose';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';

export interface IProjectApplication extends Document {
  _id: Types.ObjectId;
  project: Types.ObjectId;
  applicant: Types.ObjectId;
  roleApplied: string;
  note: string;
  status: ApplicationStatus;
  decisionNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectApplicationSchema = new Schema<IProjectApplication>(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roleApplied: { type: String, required: true, trim: true },
    note: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    decisionNote: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

ProjectApplicationSchema.index({ project: 1, applicant: 1, status: 1 });

export const ProjectApplication = mongoose.model<IProjectApplication>('ProjectApplication', ProjectApplicationSchema);
