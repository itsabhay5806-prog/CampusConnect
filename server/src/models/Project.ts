import mongoose, { Schema, Document, Types } from 'mongoose';

export type ProjectCategory = 'hackathon' | 'coursework' | 'startup' | 'research' | 'open_source';
export type ProjectStage = 'idea' | 'prototype' | 'in_progress' | 'polishing';
export type CollaborationPref = 'in_person' | 'remote' | 'hybrid';
export type ProjectStatus = 'recruiting' | 'in_progress' | 'completed' | 'closed';

export interface IProjectMember {
  user: Types.ObjectId;
  role: string;
  joinedAt: Date;
}

export interface IProject extends Document {
  _id: Types.ObjectId;
  creator: Types.ObjectId;
  college: Types.ObjectId;
  title: string;
  problemStatement: string;
  description: string;
  category: ProjectCategory;
  techStack: string[];
  requiredSkills: string[];
  projectStage: ProjectStage;
  teamSize: number;
  openRoles: string[];
  expectedCommitment: string;
  deadline?: Date;
  collaborationPreference: CollaborationPref;
  status: ProjectStatus;
  teamMembers: IProjectMember[];
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    problemStatement: { type: String, required: true, trim: true, maxlength: 1000 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    category: {
      type: String,
      enum: ['hackathon', 'coursework', 'startup', 'research', 'open_source'],
      required: true,
      index: true,
    },
    techStack: { type: [String], default: [] },
    requiredSkills: { type: [String], default: [], index: true },
    projectStage: {
      type: String,
      enum: ['idea', 'prototype', 'in_progress', 'polishing'],
      default: 'idea',
      index: true,
    },
    teamSize: { type: Number, default: 4, min: 1, max: 20 },
    openRoles: { type: [String], default: [] },
    expectedCommitment: { type: String, default: '5-10 hrs/week' },
    deadline: { type: Date },
    collaborationPreference: {
      type: String,
      enum: ['in_person', 'remote', 'hybrid'],
      default: 'hybrid',
    },
    status: {
      type: String,
      enum: ['recruiting', 'in_progress', 'completed', 'closed'],
      default: 'recruiting',
      index: true,
    },
    teamMembers: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        role: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    isReported: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProjectSchema.index({ college: 1, status: 1, createdAt: -1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
