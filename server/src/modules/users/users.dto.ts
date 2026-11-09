import { z } from 'zod';
import { Gender, Language } from '@prisma/client';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে').optional(),
  avatarUrl: z.string().url('সঠিক ছবির ইউআরএল দিন').optional(),
  language: z.enum([Language.bn, Language.en]).optional(),
  fcmToken: z.string().optional(),
});

export const tailorProfileSetupSchema = z.object({
  shopName: z.string().min(2, 'দোকানের নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  address: z.string().min(3, 'দোকানের ঠিকানা দিন'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  openingHours: z.record(z.any()).optional(),
  logoUrl: z.string().url().optional(),
  dailyOrderLimit: z.number().int().min(1).max(200).default(15),
});

export const customerProfileSetupSchema = z.object({
  name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  address: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type TailorProfileSetupInput = z.infer<typeof tailorProfileSetupSchema>;
export type CustomerProfileSetupInput = z.infer<typeof customerProfileSetupSchema>;
