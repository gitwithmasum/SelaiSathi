import { z } from 'zod';

export const createGalleryItemSchema = z.object({
  imageUrl: z.string().url('সঠিক ছবির লিংক দিন'),
  category: z.string().min(2, 'ক্যাটাগরি নির্বাচন করুন (যেমন: পাঞ্জাবি, শেরওয়ানি, থ্রি-পিস)'),
  caption: z.string().optional(),
});

export type CreateGalleryItemInput = z.infer<typeof createGalleryItemSchema>;
