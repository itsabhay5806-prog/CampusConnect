import mongoose, { Schema, Document, Types } from 'mongoose';

export type NotificationType =
  | 'post_like'
  | 'post_comment'
  | 'project_application'
  | 'application_decision'
  | 'direct_message'
  | 'campus_alert'
  | 'system';

export interface INotification extends Document {
  _id: Types.ObjectId;
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    type: {
      type: String,
      enum: [
        'post_like',
        'post_comment',
        'project_application',
        'application_decision',
        'direct_message',
        'campus_alert',
        'system',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    link: { type: String, default: '/app/feed' },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
