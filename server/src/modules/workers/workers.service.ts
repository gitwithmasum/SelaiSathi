import prisma from '../../config/database.js';
import { Prisma, WorkerPaymentType } from '@prisma/client';
import { normalizeBdPhone } from '../../utils/phone.js';
import { CreateWorkerInput, RecordWorkerPaymentInput } from './workers.dto.js';

export class WorkersService {
  async listWorkers(tailorProfileId: string) {
    const workers = await prisma.worker.findMany({
      where: { tailorId: tailorProfileId, isActive: true },
      include: {
        payments: {
          orderBy: { paidAt: 'desc' },
          take: 5,
        },
        assignedItems: {
          select: {
            id: true,
            stage: true,
            pieceRate: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return workers.map((w) => {
      const totalEarned = w.assignedItems.reduce(
        (sum, item) => sum + (item.pieceRate ? Number(item.pieceRate) : 0),
        0
      );
      const totalWagePaid = w.payments
        .filter((p) => p.type === WorkerPaymentType.WAGE)
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const totalAdvanceTaken = w.payments
        .filter((p) => p.type === WorkerPaymentType.ADVANCE)
        .reduce((sum, p) => sum + Number(p.amount), 0);

      const netDue = Math.max(0, totalEarned - totalWagePaid - totalAdvanceTaken);

      return {
        ...w,
        totalEarned,
        totalWagePaid,
        totalAdvanceTaken,
        netDue,
      };
    });
  }

  async createWorker(tailorProfileId: string, data: CreateWorkerInput) {
    const phone = normalizeBdPhone(data.phone);

    return prisma.worker.create({
      data: {
        tailorId: tailorProfileId,
        name: data.name,
        phone,
        skill: data.skill,
      },
    });
  }

  async recordPayment(tailorProfileId: string, data: RecordWorkerPaymentInput) {
    const worker = await prisma.worker.findFirst({
      where: { id: data.workerId, tailorId: tailorProfileId },
    });

    if (!worker) {
      throw new Error('কারিগর খুঁজে পাওয়া যায়নি!');
    }

    return prisma.workerPayment.create({
      data: {
        workerId: data.workerId,
        amount: new Prisma.Decimal(data.amount),
        type: data.type,
        periodStart: data.periodStart ? new Date(data.periodStart) : null,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : null,
        note: data.note || null,
      },
    });
  }
}

export const workersService = new WorkersService();
export default workersService;
