import prisma from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { AddPaymentInput, AddExpenseInput } from './payments.dto.js';
import { formatTaka } from '../../utils/bengali.js';
import smsService from '../../services/sms/sms.service.js';

export class PaymentsService {
  /**
   * Record a payment (Advance / Partial / Final).
   */
  async addPayment(tailorProfileId: string, data: AddPaymentInput) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, tailorId: tailorProfileId },
      include: { customer: true, payments: true },
    });

    if (!order) {
      throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');
    }

    const currentPaid = order.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const orderTotal = Number(order.totalPrice);
    const remainingDue = Math.max(0, orderTotal - currentPaid);

    if (data.amount > remainingDue && data.type !== 'REFUND') {
      throw new Error(
        `পরিশোধের পরিমাণ বকেয়ার চেয়ে বেশি হতে পারে না! সর্বোচ্চ বকেয়া: ${formatTaka(
          remainingDue
        )}`
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          orderId: data.orderId,
          tailorId: tailorProfileId,
          amount: new Prisma.Decimal(data.amount),
          method: data.method,
          type: data.type,
          trxId: data.trxId || null,
          note: data.note || null,
        },
      });

      // Update customer total due
      await tx.tailorCustomer.update({
        where: {
          tailorId_customerId: {
            tailorId: tailorProfileId,
            customerId: order.customerId,
          },
        },
        data: {
          totalDue: { decrement: data.amount },
        },
      });

      return p;
    });

    return {
      payment,
      remainingDue: remainingDue - data.amount,
    };
  }

  /**
   * Record a shop operational expense.
   */
  async addExpense(tailorProfileId: string, data: AddExpenseInput) {
    return prisma.expense.create({
      data: {
        tailorId: tailorProfileId,
        category: data.category,
        amount: new Prisma.Decimal(data.amount),
        note: data.note || null,
        spentAt: data.spentAt ? new Date(data.spentAt) : new Date(),
      },
    });
  }

  /**
   * Get Daily Income / Expense Report.
   */
  async getDailyReport(tailorProfileId: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(targetDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(targetDate);
    end.setHours(23, 59, 59, 999);

    const [payments, expenses, newOrdersCount, deliveredOrdersCount] =
      await Promise.all([
        prisma.payment.findMany({
          where: {
            tailorId: tailorProfileId,
            paidAt: { gte: start, lte: end },
          },
        }),
        prisma.expense.findMany({
          where: {
            tailorId: tailorProfileId,
            spentAt: { gte: start, lte: end },
          },
        }),
        prisma.order.count({
          where: {
            tailorId: tailorProfileId,
            createdAt: { gte: start, lte: end },
          },
        }),
        prisma.order.count({
          where: {
            tailorId: tailorProfileId,
            deliveredAt: { gte: start, lte: end },
          },
        }),
      ]);

    const totalIncome = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const netProfit = totalIncome - totalExpense;

    // Breakdown by payment methods
    const methodBreakdown: Record<string, number> = {};
    for (const p of payments) {
      methodBreakdown[p.method] =
        (methodBreakdown[p.method] || 0) + Number(p.amount);
    }

    return {
      date: start.toISOString().split('T')[0],
      totalIncome,
      totalExpense,
      netProfit,
      newOrdersCount,
      deliveredOrdersCount,
      methodBreakdown,
      payments,
      expenses,
    };
  }

  /**
   * Send polite Due Reminder SMS to customer.
   */
  async sendDueReminder(tailorProfileId: string, customerId: string) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId,
        },
      },
      include: {
        customer: true,
        tailor: true,
      },
    });

    if (!link || Number(link.totalDue) <= 0) {
      throw new Error('এই কাস্টমারের কোনো বকেয়া টাকা নেই!');
    }

    const message = `[সেলাই সাথী] সম্মানিত ${link.customer.name},\n"${link.tailor.shopName}"-এ আপনার মোট বকেয়ার পরিমাণ ${formatTaka(
      Number(link.totalDue)
    )}। অনুগ্রহ করে বকেয়া পরিশোধ করুন বা দোকানে যোগাযোগ করুন। ধন্যবাদ।`;

    return smsService.send({
      to: link.customer.phone,
      message,
      purpose: 'DUE_REMINDER',
    });
  }
}

export const paymentsService = new PaymentsService();
export default paymentsService;
