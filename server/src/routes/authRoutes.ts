import { Router } from 'express';
import {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  login,
  getMe,
  completeOnboarding,
  forgotPassword,
  resetPassword,
  getColleges,
  getDevOtp,
  submitCollegeSuggestion,
  getCollegeSuggestions,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter.js';
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  onboardingSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  collegeSuggestionSchema,
} from '../validators/schemas.js';

const router = Router();

router.get('/colleges', getColleges);
router.post('/college-suggestions', authRateLimiter, validateBody(collegeSuggestionSchema), submitCollegeSuggestion);
router.get('/college-suggestions', authenticate, getCollegeSuggestions);
router.post('/register', authRateLimiter, validateBody(registerSchema), register);
router.post('/verify-otp', otpRateLimiter, validateBody(verifyOtpSchema), verifyEmailOtp);
router.post('/resend-otp', otpRateLimiter, validateBody(resendOtpSchema), resendEmailOtp);
router.post('/login', authRateLimiter, validateBody(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/onboarding', authenticate, validateBody(onboardingSchema), completeOnboarding);
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authRateLimiter, validateBody(resetPasswordSchema), resetPassword);
router.get('/dev-otp', getDevOtp);

export default router;
