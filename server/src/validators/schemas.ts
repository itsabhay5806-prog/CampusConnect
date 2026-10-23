import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid college email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  collegeId: z.string().min(1, 'Please select your college'),
});

export const collegeSuggestionSchema = z.object({
  name: z.string().min(3, 'College name must be at least 3 characters').max(180),
  city: z.string().min(2, 'City must be at least 2 characters').max(100),
  district: z.string().max(100).optional(),
  state: z.string().min(2).max(100).default('Uttar Pradesh'),
  website: z.string().url('Please enter a valid website URL').optional().or(z.literal('')),
  domain: z.string().min(3, 'Domain must be at least 3 characters').max(120).optional().or(z.literal('')),
  submitterEmail: z.string().email('Please provide a valid contact email'),
});

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
  otp: z.string().trim().length(6, 'Verification code must be 6 digits'),
});

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please enter a valid email address'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter your registered college email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is missing'),
  email: z.string().email(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const onboardingSchema = z.object({
  department: z.string().min(2, 'Department is required'),
  academicYear: z.string().min(1, 'Academic year/semester is required'),
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).optional(),
  interests: z.array(z.string()).optional(),
  avatarUrl: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string().max(200).optional(),
  content: z.string().min(1, 'Content is required').max(5000),
  category: z.enum(['announcement', 'event', 'academic', 'general']).optional(),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  pinned: z.boolean().optional(),
});

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment text is required').max(1000),
});

export const resourceSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  department: z.string().min(1),
  academicYear: z.string().min(1),
  subject: z.string().min(1),
  resourceType: z.enum(['notes', 'pyq', 'study_guide', 'syllabus', 'reference']),
  fileUrl: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
});

export const lostFoundSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(2000),
  category: z.enum(['electronics', 'id_cards', 'keys', 'books', 'clothing', 'other']),
  campusLocation: z.string().min(2).max(100),
  incidentDate: z.string().min(1),
  imageUrl: z.string().optional(),
  contactPreference: z.enum(['in_app_chat', 'moderator_desk']).optional(),
});

export const communitySchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(1000),
  category: z.string().min(2).max(50),
  rules: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  avatarUrl: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(3).max(150),
  problemStatement: z.string().min(10).max(1000),
  description: z.string().min(10).max(4000),
  category: z.enum(['hackathon', 'coursework', 'startup', 'research', 'open_source']),
  techStack: z.array(z.string()).optional(),
  requiredSkills: z.array(z.string()).min(1, 'Please list at least one required skill'),
  projectStage: z.enum(['idea', 'prototype', 'in_progress', 'polishing']).optional(),
  teamSize: z.number().int().min(1).max(20).optional(),
  openRoles: z.array(z.string()).min(1, 'Please specify at least one open role'),
  expectedCommitment: z.string().optional(),
  deadline: z.string().optional(),
  collaborationPreference: z.enum(['in_person', 'remote', 'hybrid']).optional(),
});

export const projectApplicationSchema = z.object({
  roleApplied: z.string().min(1, 'Please select or enter the role applied for'),
  note: z.string().min(5, 'Please introduce yourself and why you want to join').max(1000),
});

export const reportSchema = z.object({
  targetType: z.enum(['post', 'comment', 'resource', 'lost_found', 'project', 'user']),
  targetId: z.string().min(1),
  reason: z.enum(['spam', 'harassment', 'impersonation', 'inappropriate', 'fraud', 'copyright', 'other']),
  details: z.string().min(3).max(1000),
});
