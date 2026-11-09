import prisma from '../../config/database.js';
import { CreateTrialSlotInput, BookTrialInput, AddHolidayInput } from './calendar.dto.js';
import { OrderStatus } from '@prisma/client';

export class CalendarService {
  /**
   * Get monthly workload with capacity radar data.
   */
  async getMonthlyWorkload(tailorProfileId: string, year: number, month: number) {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
      select: { dailyOrderLimit: true, rushMode: true },
    });

    const dailyLimit = tailor?.dailyOrderLimit || 15;

    // Get orders scheduled for delivery in this month
    const orders = await prisma.order.findMany({
      where: {
        tailorId: tailorProfileId,
        deliveryDate: { gte: start, lte: end },
        status: { notIn: [OrderStatus.CANCELLED] },
      },
      select: {
        id: true,
        orderNo: true,
        deliveryDate: true,
        status: true,
        priority: true,
        fabricTagCode: true,
        customer: { select: { name: true, phone: true } },
      },
    });

    // Group by day of month (YYYY-MM-DD)
    const dayMap: Record<string, any[]> = {};
    for (const ord of orders) {
      const dateKey = ord.deliveryDate.toISOString().split('T')[0];
      if (!dayMap[dateKey]) dayMap[dateKey] = [];
      dayMap[dateKey].push(ord);
    }

    // Holidays for this tailor
    const holidays = await prisma.holiday.findMany({
      where: { tailorId: tailorProfileId },
    });

    return {
      year,
      month,
      dailyOrderLimit: dailyLimit,
      workloadByDate: Object.entries(dayMap).map(([date, items]) => ({
        date,
        count: items.length,
        isOverloaded: items.length >= dailyLimit,
        orders: items,
      })),
      holidays: holidays.map((h) => ({
        date: h.date.toISOString().split('T')[0],
        reason: h.reason,
      })),
    };
  }

  /**
   * Get trial fitting slots for a date.
   */
  async getTrialSlots(tailorProfileId: string, dateStr?: string) {
    const target = dateStr ? new Date(dateStr) : new Date();
    const start = new Date(target);
    start.setHours(0, 0, 0, 0);
    const end = new Date(target);
    end.setHours(23, 59, 59, 999);

    return prisma.trialSlot.findMany({
      where: {
        tailorId: tailorProfileId,
        startsAt: { gte: start, lte: end },
      },
      include: {
        booking: {
          include: {
            order: { select: { orderNo: true } },
            customer: { select: { name: true, phone: true } },
          },
        },
      },
      orderBy: { startsAt: 'asc' },
    });
  }

  /**
   * Create trial fitting slot (e.g. 11:00 AM - 11:30 AM).
   */
  async createTrialSlot(tailorProfileId: string, data: CreateTrialSlotInput) {
    return prisma.trialSlot.create({
      data: {
        tailorId: tailorProfileId,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt),
      },
    });
  }

  /**
   * Customer books a trial slot.
   */
  async bookTrialSlot(userId: string, data: BookTrialInput) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');

    const slot = await prisma.trialSlot.findUnique({
      where: { id: data.slotId },
    });

    if (!slot || slot.isBooked) {
      throw new Error('এই ট্রায়াল স্লটটি খালি নেই!');
    }

    return prisma.$transaction(async (tx) => {
      await tx.trialSlot.update({
        where: { id: data.slotId },
        data: { isBooked: true },
      });

      return tx.trialBooking.create({
        data: {
          slotId: data.slotId,
          orderId: data.orderId,
          customerId: customer.id,
          status: 'PENDING',
        },
        include: {
          slot: true,
          order: { select: { orderNo: true } },
        },
      });
    });
  }

  /**
   * Add shop holiday.
   */
  async addHoliday(tailorProfileId: string, data: AddHolidayInput) {
    return prisma.holiday.upsert({
      where: {
        tailorId_date: {
          tailorId: tailorProfileId,
          date: new Date(data.date),
        },
      },
      create: {
        tailorId: tailorProfileId,
        date: new Date(data.date),
        reason: data.reason,
      },
      update: {
        reason: data.reason,
      },
    });
  }
}

export const calendarService = new CalendarService();
export default calendarService;
