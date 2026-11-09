import { Request, Response } from 'express';
import prisma from '../../config/database.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { getStageBengaliLabel } from '../../utils/bengali.js';

export class PublicController {
  async trackOrder(req: Request, res: Response) {
    try {
      const token = req.params.token as string;

      const order = await prisma.order.findUnique({
        where: { trackingToken: token },
        include: {
          tailor: {
            include: {
              user: true,
            },
          },
          customer: true,
          items: {
            include: {
              garmentType: true,
              stageHistory: {
                orderBy: { changedAt: 'desc' },
              },
            },
          },
          payments: {
            orderBy: { paidAt: 'desc' },
          },
        },
      });

      if (!order) {
        return sendError(
          res,
          'অর্ডারটি খুঁজে পাওয়া যায়নি! সঠিক ট্র্যাকিং লিংক ব্যবহার করুন।',
          404
        );
      }

      const totalPaid = order.payments.reduce(
        (sum: number, p: any) => sum + Number(p.amount),
        0
      );
      const dueAmount = Math.max(0, Number(order.totalPrice) - totalPaid);

      // Enhance items with readable Bengali stage names
      const enhancedItems = order.items.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        stage: item.stage,
        stageLabelBn: getStageBengaliLabel(item.stage),
        selectedStyles: item.selectedStyles,
        garmentType: {
          nameBn: item.garmentType.nameBn,
          nameEn: item.garmentType.nameEn,
          icon: item.garmentType.icon,
        },
        stageHistory: item.stageHistory.map((h: any) => ({
          fromStage: h.fromStage,
          toStage: h.toStage,
          changedAt: h.changedAt,
          note: h.note,
        })),
      }));

      return sendSuccess(res, {
        orderNo: order.orderNo,
        status: order.status,
        priority: order.priority,
        deliveryDate: order.deliveryDate,
        delayReason: order.delayReason,
        fabricTagCode: order.fabricTagCode,
        customerName: order.customer.name,
        shop: {
          name: order.tailor.shopName,
          phone: order.tailor.user.phone,
          address: order.tailor.address,
          logoUrl: order.tailor.logoUrl,
        },
        financials: {
          totalPrice: Number(order.totalPrice),
          totalPaid,
          dueAmount,
        },
        items: enhancedItems,
      });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const publicController = new PublicController();
export default publicController;
