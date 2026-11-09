import { z } from 'zod';
import { Role } from '@prisma/client';

export const sendOtpSchema = z.object({
  phone: z
    .string()
    .min(10, 'মোবাইল নম্বর কমপক্ষে ১১ ডিজিট হতে হবে')
    .max(15, 'মোবাইল নম্বর খুব বড়')
    .regex(
      /^(?:\+88|88)?(01[3-9]\d{8})$/,
      'সঠিক বাংলাদেশি মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)'
    ),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন'),
  otp: z
    .string()
    .length(6, 'ওটিপি কোড অবশ্যই ৬ সংখ্যার হতে হবে')
    .regex(/^\d{6}$/, 'ওটিপি শুধুমাত্র সংখ্যা হতে হবে'),
  deviceInfo: z.string().optional(),
});

export const selectRoleSchema = z.object({
  role: z.enum([Role.TAILOR, Role.CUSTOMER, Role.WORKER], {
    errorMap: () => ({ message: 'সঠিক রোল নির্বাচন করুন (TAILOR অথবা CUSTOMER)' }),
  }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'রিফ্রেশ টোকেন প্রদান করুন'),
});

export type SendOtpInput = z.infer<typeof sendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
export type SelectRoleInput = z.infer<typeof selectRoleSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
