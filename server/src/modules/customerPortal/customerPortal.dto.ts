import { z } from 'zod';

export const joinShopSchema = z.object({
  shopCode: z.string().min(3, 'দোকানের শপ কোড দিন (যেমন: SS-1024)'),
});

export const orderRequestSchema = z.object({
  tailorId: z.string().uuid('টেইলার নির্বাচন করুন'),
  details: z.record(z.any()),
  photoUrls: z.array(z.string().url()).optional().default([]),
  preferredDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export type JoinShopInput = z.infer<typeof joinShopSchema>;
export type OrderRequestInput = z.infer<typeof orderRequestSchema>;
