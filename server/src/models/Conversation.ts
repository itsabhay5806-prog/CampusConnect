import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: {
    text: string;
    sender: Types.ObjectId;
    createdAt: Date;
  };
  isGroup: boolean;
  groupName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      text: { type: String, trim: true },
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
    isGroup: { type: Boolean, default: false },
    groupName: { type: String, trim: true },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
