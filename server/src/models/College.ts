import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICollege extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  domains: string[];
  city: string;
  district?: string;
  state: string;
  website?: string;
  institutionType?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CollegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domains: { type: [String], required: true, lowercase: true },
    city: { type: String, required: true, trim: true },
    district: { type: String, trim: true },
    state: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    institutionType: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CollegeSchema.index({ domains: 1 });
CollegeSchema.index({ city: 1, district: 1 });
CollegeSchema.index({ name: 1 });

export const College = mongoose.model<ICollege>('College', CollegeSchema);
