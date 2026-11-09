import { z } from 'zod';
import { WorkerPaymentType, WorkerSkill } from '@prisma/client';

export const createWorkerSchema = z.object({
  name: z.string().min(2, 'কারিগর বা কাটিং মাস্টারের নাম দিন'),
  phone: z
    .string()
    .min(10)
    .max(15)
    .regex(/^(?:\+88|88)?(01[3-9]\d{8})$/, 'সঠিক বাংলাদেশি মোবাইল নম্বর দিন'),
  skill: z.enum([
    WorkerSkill.CUTTING_MASTER,
    WorkerSkill.SEWING_OPERATOR,
    WorkerSkill.IRON_FINISHER,
    WorkerSkill.BUTTON_HANDWORK,
    WorkerSkill.ALL_ROUNDER,
  ]).default(WorkerSkill.SEWING_OPERATOR),
});

export const recordWorkerPaymentSchema = z.object({
  workerId: z.string().uuid('সঠিক কারিগর নির্বাচন করুন'),
  amount: z.number().positive('টাকার পরিমাণ দিন'),
  type: z.enum([WorkerPaymentType.WAGE, WorkerPaymentType.ADVANCE]).default(WorkerPaymentType.WAGE),
  periodStart: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  periodEnd: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
  note: z.string().optional(),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type RecordWorkerPaymentInput = z.infer<typeof recordWorkerPaymentSchema>;
