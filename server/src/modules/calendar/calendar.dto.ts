import { z } from 'zod';

export const createTrialSlotSchema = z.object({
  startsAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
  endsAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)),
});

export const bookTrialSchema = z.object({
  orderId: z.string().uuid('সঠিক অর্ডার নির্বাচন করুন'),
  slotId: z.string().uuid('সঠিক ট্রায়াল স্লট নির্বাচন করুন'),
});

export const addHolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'সঠিক তারিখ দিন (YYYY-MM-DD)'),
  reason: z.string().min(2, 'ছুটির কারণ উল্লেখ করুন (যেমন: শুক্রবার, ঈদ-উল-ফিতর)'),
});

export type CreateTrialSlotInput = z.infer<typeof createTrialSlotSchema>;
export type BookTrialInput = z.infer<typeof bookTrialSchema>;
export type AddHolidayInput = z.infer<typeof addHolidaySchema>;
