import nodemailer from 'nodemailer';
import { ENV } from './env.js';

let transporter: nodemailer.Transporter | null = null;
export const devOtpStore = new Map<string, string>(); // In-memory record for dev inspection

export async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (process.env.NODE_ENV === 'test') {
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }

  if (ENV.SMTP_HOST && ENV.SMTP_USER && ENV.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } else {
    // Development fallback: creates test ethereal account or console-based transporter
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('ℹ️  Ethereal test mailer initialized for development.');
  }

  return transporter;
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  devOtpStore.set(email.toLowerCase(), otp);

  if (ENV.DEV_OTP_CONSOLE) {
    console.log(`\n======================================================`);
    console.log(`🔐 [CAMPUSCONNECT DEV OTP] To: ${email} | Code: [ ${otp} ]`);
    console.log(`⏰ Valid for 10 minutes.`);
    console.log(`======================================================\n`);
  }

  try {
    const mail = await getTransporter();
    const info = await mail.sendMail({
      from: `"CampusConnect" <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: `CampusConnect Verification Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Welcome to CampusConnect</h2>
          <p>You requested a verification code for your college email address.</p>
          <div style="background-color: #eff6ff; border: 1px dashed #3b82f6; border-radius: 6px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e3a8a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">CampusConnect • One campus. One verified community. Multiple student needs.</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`✉️  Ethereal Mail Preview URL: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error('Failed to send email via SMTP, logged in console fallback:', err);
    return true; // Still allow dev workflow
  }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<boolean> {
  if (ENV.DEV_OTP_CONSOLE) {
    console.log(`\n======================================================`);
    console.log(`🔑 [CAMPUSCONNECT PASSWORD RESET] To: ${email}`);
    console.log(`🔗 Link: ${resetUrl}`);
    console.log(`======================================================\n`);
  }

  try {
    const mail = await getTransporter();
    await mail.sendMail({
      from: `"CampusConnect" <${ENV.EMAIL_FROM}>`,
      to: email,
      subject: `CampusConnect Password Reset Request`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e3a8a; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <div style="margin: 24px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 14px;">This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });
    return true;
  } catch (err) {
    console.error('Failed to send reset email:', err);
    return true;
  }
}
