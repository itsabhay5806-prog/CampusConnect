import mongoose, { Schema, Document, Types } from 'mongoose';

export type SavedItemType = 'post' | 'resource' | 'project';

export interface ISavedItem extends Document {
  user: Types.ObjectId;
  itemType: SavedItemType;
  itemId: Types.ObjectId;
  createdAt: Date;
}

const SavedItemSchema = new Schema<ISavedItem>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    itemType: { type: String, enum: ['post', 'resource', 'project'], required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SavedItemSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export const SavedItem = mongoose.model<ISavedItem>('SavedItem', SavedItemSchema);
