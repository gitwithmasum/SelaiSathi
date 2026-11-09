import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { otpLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  sendOtpSchema,
  verifyOtpSchema,
  selectRoleSchema,
  refreshTokenSchema,
} from './auth.dto.js';

const router = Router();

// Public routes
router.post('/send-otp', otpLimiter, validate(sendOtpSchema), authController.sendOtp);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authController.logout);

// Authenticated routes
router.post('/select-role', authenticate, validate(selectRoleSchema), authController.selectRole);
router.post('/logout-all', authenticate, authController.logoutAll);
router.get('/me', authenticate, authController.getMe);

export default router;
