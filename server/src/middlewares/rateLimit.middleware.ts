import rateLimit from 'express-rate-limit';
import { sendError } from '../utils/response.js';

export const otpLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 2, // Limit each IP to 2 OTP requests per minute
  message: {
    success: false,
    error: {
      message: 'অনুগ্রহ করে অপেক্ষা করুন! প্রতি ১ মিনিটে সর্বোচ্চ একটি ওটিপি পাঠানো যাবে।',
      code: 'TOO_MANY_REQUESTS',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'অনুগ্রহ করে ১ মিনিট অপেক্ষা করুন! ঘনঘন ওটিপি পাঠানোর চেষ্টা করবেন না।',
      429,
      'TOO_MANY_REQUESTS'
    );
  },
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'সার্ভারে অনেক বেশি রিকোয়েস্ট আসছে। কিছু সময় পর চেষ্টা করুন।',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
});
