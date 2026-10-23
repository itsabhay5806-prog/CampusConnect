import mongoose, { Schema, Document, Types } from 'mongoose';

export type ResourceType = 'notes' | 'pyq' | 'study_guide' | 'syllabus' | 'reference';

export interface IResource extends Document {
  _id: Types.ObjectId;
  uploader: Types.ObjectId;
  college: Types.ObjectId;
  title: string;
  description?: string;
  department: string;
  academicYear: string;
  subject: string;
  resourceType: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  downloadsCount: number;
  isReported: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    department: { type: String, required: true, trim: true, index: true },
    academicYear: { type: String, required: true, trim: true, index: true },
    subject: { type: String, required: true, trim: true, index: true },
    resourceType: {
      type: String,
      enum: ['notes', 'pyq', 'study_guide', 'syllabus', 'reference'],
      required: true,
      index: true,
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    downloadsCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ResourceSchema.index({ college: 1, department: 1, subject: 1 });
ResourceSchema.index({ college: 1, resourceType: 1 });

export const Resource = mongoose.model<IResource>('Resource', ResourceSchema);
