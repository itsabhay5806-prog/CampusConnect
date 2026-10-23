import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordResetToken extends Document {
  email: string;
  token: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const PasswordResetToken = mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
