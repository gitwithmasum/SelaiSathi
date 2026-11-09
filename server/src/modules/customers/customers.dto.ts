import { z } from 'zod';
import { Gender } from '@prisma/client';

export const addCustomerSchema = z.object({
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন'),
  name: z.string().min(2, 'কাস্টমারের নাম দিন'),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  address: z.string().optional(),
  tag: z.string().max(50).optional().default('REGULAR'),
  notes: z.string().optional(),
  sendInviteSms: z.boolean().optional().default(true),
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  gender: z.enum([Gender.MALE, Gender.FEMALE, Gender.OTHER]).optional(),
  address: z.string().optional(),
  tag: z.string().max(50).optional(),
  notes: z.string().optional(),
});

export const listCustomersQuerySchema = z.object({
  search: z.string().optional(),
  tag: z.string().optional(),
  hasDueOnly: z.enum(['true', 'false']).optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type AddCustomerInput = z.infer<typeof addCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type ListCustomersQuery = z.infer<typeof listCustomersQuerySchema>;
