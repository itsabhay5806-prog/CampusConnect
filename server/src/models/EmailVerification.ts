import mongoose, { Schema, Document } from 'mongoose';

export interface IEmailVerification extends Document {
  email: string;
  otp: string;
  plainOtpForDev?: string;
  expiresAt: Date;
  attempts: number;
  lastResentAt: Date;
  createdAt: Date;
}

const EmailVerificationSchema = new Schema<IEmailVerification>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    otp: { type: String, required: true },
    plainOtpForDev: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // Auto-delete on expiry via TTL index
    attempts: { type: Number, default: 0 },
    lastResentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EmailVerification = mongoose.model<IEmailVerification>('EmailVerification', EmailVerificationSchema);
