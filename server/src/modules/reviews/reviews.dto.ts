import { z } from 'zod';

export const createReviewSchema = z.object({
  orderId: z.string().uuid('সঠিক অর্ডার নির্বাচন করুন'),
  rating: z.number().int().min(1).max(5, 'রেটিং ১ থেকে ৫ এর মধ্যে হতে হবে'),
  comment: z.string().optional(),
});

export const replyReviewSchema = z.object({
  tailorReply: z.string().min(2, 'উত্তর লিখুন'),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ReplyReviewInput = z.infer<typeof replyReviewSchema>;
