import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { College } from '../models/College.js';
import { EmailVerification } from '../models/EmailVerification.js';
import { PasswordResetToken } from '../models/PasswordResetToken.js';
import { sendOtpEmail, sendPasswordResetEmail, devOtpStore } from '../config/mailer.js';
import { ENV } from '../config/env.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

import { CollegeSuggestion } from '../models/CollegeSuggestion.js';
import {
  normalizeEmail,
  extractEmailDomain,
  isInstitutionalDomainAllowed,
  isSuspiciousOrDisposableDomain,
  isValidDomainSyntax,
} from '../utils/domainValidator.js';

function generateJwt(user: IUser): string {
  const collegeId = (user.college as any)?._id
    ? (user.college as any)._id.toString()
    : user.college?.toString();

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      collegeId,
    },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN as any }
  );
}

export async function getColleges(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, city, state } = req.query;

    const query: any = { isActive: true };

    if (city && typeof city === 'string' && city.toLowerCase() !== 'all') {
      query.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
    }

    if (state && typeof state === 'string') {
      query.state = { $regex: new RegExp(`^${state.trim()}$`, 'i') };
    }

    if (search && typeof search === 'string' && search.trim()) {
      const s = search.trim();
      query.$or = [
        { name: { $regex: s, $options: 'i' } },
        { code: { $regex: s, $options: 'i' } },
        { city: { $regex: s, $options: 'i' } },
        { district: { $regex: s, $options: 'i' } },
        { domains: { $regex: s, $options: 'i' } },
      ];
    }

    const colleges = await College.find(query)
      .select('name code domains city district state website institutionType isActive')
      .sort({ name: 1 })
      .lean();

    const allCities = await College.find({ isActive: true }).distinct('city');

    return res.json({
      success: true,
      colleges,
      total: colleges.length,
      availableCities: ['All', ...allCities.filter(Boolean)],
    });
  } catch (err) {
    next(err);
  }
}

export async function submitCollegeSuggestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, city, district, state, website, domain, submitterEmail } = req.body;

    const normEmail = normalizeEmail(submitterEmail);
    const normName = name.trim();
    const normCity = city.trim();
    const normDomain = domain ? domain.trim().toLowerCase().replace(/^@/, '') : undefined;

    // Check if college is already in approved list
    const existingApproved = await College.findOne({
      name: { $regex: new RegExp(`^${normName}$`, 'i') },
      city: { $regex: new RegExp(`^${normCity}$`, 'i') },
    });

    if (existingApproved) {
      return res.status(409).json({
        success: false,
        message: `"${existingApproved.name}" in ${existingApproved.city} is already approved and available in the college list.`,
      });
    }

    // Check if duplicate suggestion is already pending
    const existingPending = await CollegeSuggestion.findOne({
      name: { $regex: new RegExp(`^${normName}$`, 'i') },
      city: { $regex: new RegExp(`^${normCity}$`, 'i') },
      status: 'pending',
    });

    if (existingPending) {
      return res.status(409).json({
        success: false,
        message: 'A suggestion for this institution has already been submitted and is currently pending review.',
      });
    }

    const suggestion = await CollegeSuggestion.create({
      name: normName,
      city: normCity,
      district: district ? district.trim() : undefined,
      state: state ? state.trim() : 'Uttar Pradesh',
      website: website ? website.trim() : undefined,
      domain: normDomain,
      submitterEmail: normEmail,
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your institution suggestion has been submitted for administrative verification.',
      suggestionId: suggestion._id,
    });
  } catch (err) {
    next(err);
  }
}

export async function getCollegeSuggestions(_req: Request, res: Response, next: NextFunction) {
  try {
    const suggestions = await CollegeSuggestion.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, suggestions });
  } catch (err) {
    next(err);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, email, password, collegeId } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // 1. Validate email domain syntax & reject disposable/suspicious email providers
    const emailDomain = extractEmailDomain(normalizedEmail);
    if (!emailDomain || !isValidDomainSyntax(emailDomain)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid college email address.' });
    }

    if (isSuspiciousOrDisposableDomain(emailDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Personal email addresses (Gmail, Yahoo, Outlook, etc.) or disposable email services cannot be used. Please enter your official institutional email.',
      });
    }

    // 2. Verify college exists
    const college = await College.findById(collegeId);
    if (!college || !college.isActive) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive college selected.' });
    }

    // 3. Validate email domain matches college approved domains with strict dot boundary
    const isDomainAllowed = isInstitutionalDomainAllowed(emailDomain, college.domains);

    if (!isDomainAllowed) {
      return res.status(400).json({
        success: false,
        message: `Email domain "@${emailDomain}" does not match approved institutional domains for ${college.name} (${college.domains.map((d) => '@' + d).join(', ')}).`,
      });
    }

    // 4. Check existing user
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this college email is already registered and verified. Please sign in.',
        });
      }
      // If registered but unverified, update password & college
      const salt = await bcrypt.genSalt(10);
      existingUser.password = await bcrypt.hash(password, salt);
      existingUser.name = name.trim();
      existingUser.college = college._id;
      await existingUser.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        college: college._id,
        role: 'student',
        isVerified: false,
        isOnboarded: false,
      });
    }

    // 5. Generate 6-digit OTP & securely hash it before saving in DB
    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp: hashedOtp,
        plainOtpForDev: ENV.DEV_OTP_CONSOLE && ENV.NODE_ENV !== 'production' ? otp : undefined,
        expiresAt,
        attempts: 0,
        lastResentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // 6. Send OTP Email (passes plain 6-digit OTP to inbox)
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(201).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}. Please enter the 6-digit code.`,
      email: normalizedEmail,
      devNotice: ENV.DEV_OTP_CONSOLE && ENV.NODE_ENV !== 'production' ? `[Dev Mode Active: Code logged to terminal & viewable via dev helper]` : undefined,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmailOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = normalizeEmail(email);

    // 1. Check if user is already verified (smooth idempotent recovery)
    const existingUser = await User.findOne({ email: normalizedEmail }).populate(
      'college',
      'name code domains city district state'
    );

    if (existingUser && existingUser.isVerified) {
      const token = generateJwt(existingUser);
      return res.json({
        success: true,
        alreadyVerified: true,
        message: 'Your college email is already verified! Welcome to CampusConnect.',
        token,
        user: {
          _id: existingUser._id.toString(),
          id: existingUser._id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          isVerified: existingUser.isVerified,
          isOnboarded: existingUser.isOnboarded,
          college: existingUser.college,
          avatarUrl: existingUser.avatarUrl,
        },
      });
    }

    // 2. Find pending verification record
    const record = await EmailVerification.findOne({ email: normalizedEmail });
    if (!record) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found for this email. Please click Resend Code.',
      });
    }

    if (new Date() > record.expiresAt) {
      await EmailVerification.deleteOne({ _id: record._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please click Resend Code.',
      });
    }

    if (record.attempts >= 5) {
      await EmailVerification.deleteOne({ _id: record._id });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    const trimmedOtp = String(otp || '').trim();
    // Compare with bcrypt hash, plainOtpForDev fallback, or string match
    const isOtpValid =
      (await bcrypt.compare(trimmedOtp, record.otp).catch(() => false)) ||
      record.otp === trimmedOtp ||
      (record.plainOtpForDev && record.plainOtpForDev === trimmedOtp);

    if (!isOtpValid) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({
        success: false,
        message: `Incorrect verification code. ${5 - record.attempts} attempts remaining.`,
      });
    }

    // Success: activate user
    const user = existingUser || (await User.findOne({ email: normalizedEmail }).populate('college', 'name code domains city district state'));
    if (!user) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    user.isVerified = true;
    await user.save();

    // Invalidate OTP immediately to prevent reuse
    await EmailVerification.deleteOne({ _id: record._id });
    devOtpStore.delete(normalizedEmail);

    const token = generateJwt(user);

    return res.json({
      success: true,
      message: 'College email successfully verified! Welcome to CampusConnect.',
      token,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
        college: user.college,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function resendEmailOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No registration pending for this email address.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email address is already verified. Please sign in.' });
    }

    const existing = await EmailVerification.findOne({ email: normalizedEmail });
    if (existing) {
      const cooldownMs = 60 * 1000; // 60 seconds cooldown
      const timeSinceLastResend = Date.now() - new Date(existing.lastResentAt).getTime();
      if (timeSinceLastResend < cooldownMs) {
        const waitSec = Math.ceil((cooldownMs - timeSinceLastResend) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSec} seconds before requesting another code.`,
        });
      }
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otp: hashedOtp,
        plainOtpForDev: ENV.DEV_OTP_CONSOLE && ENV.NODE_ENV !== 'production' ? otp : undefined,
        expiresAt,
        attempts: 0,
        lastResentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    await sendOtpEmail(normalizedEmail, otp);

    return res.json({
      success: true,
      message: `A fresh verification code was sent to ${normalizedEmail}.`,
    });
  } catch (err) {
    next(err);
  }
}

export async function getDevOtp(req: Request, res: Response, next: NextFunction) {
  try {
    const rawEmail = req.query.email as string;
    const email = rawEmail ? normalizeEmail(rawEmail) : undefined;
    if (!ENV.DEV_OTP_CONSOLE || ENV.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Dev helper is disabled in production.' });
    }

    // Check if user is already verified
    if (email) {
      const user = await User.findOne({ email }).select('isVerified');
      if (user && user.isVerified) {
        return res.json({
          success: true,
          email,
          alreadyVerified: true,
          message: 'Account is already verified.',
          otp: null,
        });
      }
    }

    let otp = email ? devOtpStore.get(email) : null;
    if (!otp && email) {
      const record = await EmailVerification.findOne({ email });
      if (record && record.plainOtpForDev && new Date() <= record.expiresAt) {
        otp = record.plainOtpForDev;
      }
    }

    return res.json({
      success: true,
      email,
      otp: otp || null,
      note: 'Available in development mode for seamless local testing.',
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const user = await User.findOne({ email: normalizedEmail })
      .select('+password')
      .populate('college', 'name code domains city state');

    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isVerified) {
      // Trigger a new OTP for convenience
      const otp = crypto.randomInt(100000, 999999).toString();
      const hashedOtp = await bcrypt.hash(otp, 10);
      await EmailVerification.findOneAndUpdate(
        { email: normalizedEmail },
        {
          otp: hashedOtp,
          plainOtpForDev: ENV.DEV_OTP_CONSOLE && ENV.NODE_ENV !== 'production' ? otp : undefined,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          attempts: 0,
          lastResentAt: new Date(),
        },
        { upsert: true }
      );
      await sendOtpEmail(normalizedEmail, otp);

      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: normalizedEmail,
        message: 'Your college email is not verified yet. A verification code has been sent.',
      });
    }

    const token = generateJwt(user);

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id.toString(),
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isOnboarded: user.isOnboarded,
        department: user.department,
        academicYear: user.academicYear,
        bio: user.bio,
        skills: user.skills,
        interests: user.interests,
        avatarUrl: user.avatarUrl,
        college: user.college,
        privacySettings: user.privacySettings,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    const user = await User.findById(req.user._id).populate('college', 'name code domains city state');
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

export async function completeOnboarding(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const { department, academicYear, bio, skills, interests, avatarUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (department) user.department = department.trim();
    if (academicYear) user.academicYear = academicYear.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (Array.isArray(skills)) user.skills = skills.map((s: string) => s.trim()).filter(Boolean);
    if (Array.isArray(interests)) user.interests = interests.map((i: string) => i.trim()).filter(Boolean);
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.isOnboarded = true;

    await user.save();
    const populated = await User.findById(user._id).populate('college', 'name code domains city state');

    return res.json({
      success: true,
      message: 'Student profile onboarding completed successfully!',
      user: populated,
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Don't disclose user non-existence for security
      return res.json({
        success: true,
        message: 'If a matching account exists, password reset instructions have been sent.',
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await PasswordResetToken.create({
      email: normalizedEmail,
      token,
      expiresAt,
    });

    const resetUrl = `${ENV.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;
    await sendPasswordResetEmail(normalizedEmail, resetUrl);

    return res.json({
      success: true,
      message: 'If a matching account exists, password reset instructions have been sent.',
      ...(ENV.DEV_OTP_CONSOLE && { devToken: token }),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, email, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const resetRecord = await PasswordResetToken.findOne({
      token,
      email: normalizedEmail,
      used: false,
    });

    if (!resetRecord || new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.',
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    resetRecord.used = true;
    await resetRecord.save();

    return res.json({
      success: true,
      message: 'Password has been successfully reset. You can now log in with your new password.',
    });
  } catch (err) {
    next(err);
  }
}
