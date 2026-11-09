import prisma from '../../config/database.js';
import { Prisma, PaymentMethod, PaymentType } from '@prisma/client';
import { BkashProvider } from './providers/bkash.provider.js';
import { NagadProvider } from './providers/nagad.provider.js';
import { formatTaka } from '../../utils/bengali.js';
import smsService from '../../services/sms/sms.service.js';

export class MfsService {
  private bkash = new BkashProvider();
  private nagad = new NagadProvider();

  async initiate(
    orderId: string,
    amount: number,
    gateway: 'BKASH' | 'NAGAD',
    callbackUrl: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        tailor: true,
        payments: true,
      },
    });

    if (!order) throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');

    const totalPaid = order.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const due = Math.max(0, Number(order.totalPrice) - totalPaid);

    if (amount > due) {
      throw new Error(
        `পরিশোধের পরিমাণ বকেয়ার চেয়ে বেশি হতে পারে না! সর্বোচ্চ বকেয়া: ${formatTaka(
          due
        )}`
      );
    }

    const provider = gateway === 'BKASH' ? this.bkash : this.nagad;

    const result = await provider.initiatePayment({
      orderId,
      orderNo: order.orderNo,
      amount,
      customerPhone: order.customer.phone,
      callbackUrl,
    });

    return result;
  }

  async verifyAndRecord(
    orderId: string,
    gateway: 'BKASH' | 'NAGAD',
    paymentId: string,
    params?: any
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { customer: true, tailor: true },
    });

    if (!order) throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');

    const provider = gateway === 'BKASH' ? this.bkash : this.nagad;
    const verifyResult = await provider.verifyPayment(paymentId, params);

    if (!verifyResult.success || verifyResult.status !== 'COMPLETED') {
      throw new Error('পেমেন্ট যাচাইকরণ ব্যর্থ হয়েছে!');
    }

    const method: PaymentMethod =
      gateway === 'BKASH' ? PaymentMethod.BKASH : PaymentMethod.NAGAD;

    // Record in database
    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          orderId,
          tailorId: order.tailorId,
          amount: new Prisma.Decimal(verifyResult.amount),
          method,
          type: PaymentType.PARTIAL,
          trxId: verifyResult.trxId,
          note: `${gateway} অনলাইন পেমেন্ট (TrxID: ${verifyResult.trxId})`,
        },
      });

      // Update customer total due
      await tx.tailorCustomer.update({
        where: {
          tailorId_customerId: {
            tailorId: order.tailorId,
            customerId: order.customerId,
          },
        },
        data: {
          totalDue: { decrement: verifyResult.amount },
        },
      });

      return p;
    });

    // Send confirmation SMS
    const msg = `[সেলাই সাথী] "${order.tailor.shopName}": আপনার ${formatTaka(
      verifyResult.amount
    )} পেমেন্ট (${gateway}) সফল হয়েছে। TrxID: ${
      verifyResult.trxId
    }। বিস্তারিত: https://selaisathi.com/track/${order.trackingToken}`;

    smsService.send({
      to: order.customer.phone,
      message: msg,
      purpose: 'ORDER_UPDATE',
    }).catch((e) => console.error('Payment confirmation SMS error:', e));

    return {
      payment,
      trxId: verifyResult.trxId,
      amount: verifyResult.amount,
    };
  }
}

export const mfsService = new MfsService();
export default mfsService;
