import mongoose, { Schema, Document, Types } from 'mongoose';

export type ModerationActionType =
  | 'hide_content'
  | 'delete_content'
  | 'warn_user'
  | 'suspend_user'
  | 'dismiss_report';

export interface IModerationAction extends Document {
  _id: Types.ObjectId;
  moderator: Types.ObjectId;
  action: ModerationActionType;
  targetType: string;
  targetId: Types.ObjectId;
  reason: string;
  createdAt: Date;
}

const ModerationActionSchema = new Schema<IModerationAction>(
  {
    moderator: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: ['hide_content', 'delete_content', 'warn_user', 'suspend_user', 'dismiss_report'],
      required: true,
    },
    targetType: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ModerationAction = mongoose.model<IModerationAction>('ModerationAction', ModerationActionSchema);
