import { z } from 'zod';
import { PaymentMethod, PaymentType } from '@prisma/client';

export const addPaymentSchema = z.object({
  orderId: z.string().uuid('সঠিক অর্ডার আইডি দিন'),
  amount: z.number().positive('পরিশোধের পরিমাণ ০ টাকার বেশি হতে হবে'),
  method: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BKASH,
    PaymentMethod.NAGAD,
    PaymentMethod.BANK,
    PaymentMethod.OTHER,
  ]).default(PaymentMethod.CASH),
  type: z.enum([
    PaymentType.ADVANCE,
    PaymentType.PARTIAL,
    PaymentType.FINAL,
    PaymentType.REFUND,
  ]).default(PaymentType.PARTIAL),
  trxId: z.string().optional(),
  note: z.string().optional(),
});

export const addExpenseSchema = z.object({
  category: z.string().min(2, 'খরচের খাত উল্লেখ করুন (যেমন: সুতা, বোতাম, দোকান ভাড়া)'),
  amount: z.number().positive('খরচের পরিমাণ দিন'),
  note: z.string().optional(),
  spentAt: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export const sendDueReminderSchema = z.object({
  customerId: z.string().uuid('কাস্টমার আইডি দিন'),
});

export type AddPaymentInput = z.infer<typeof addPaymentSchema>;
export type AddExpenseInput = z.infer<typeof addExpenseSchema>;
export type SendDueReminderInput = z.infer<typeof sendDueReminderSchema>;
