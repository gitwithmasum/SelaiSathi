import prisma from '../../config/database.js';
import {
  OrderStatus,
  ItemStage,
  PaymentType,
  Prisma,
} from '@prisma/client';
import {
  generateOrderNumber,
  generateFabricTagCode,
  generateRandomToken,
} from '../../utils/crypto.js';
import {
  CreateOrderInput,
  UpdateItemStageInput,
  PostponeDeliveryInput,
  ListOrdersQuery,
} from './orders.dto.js';
import { getStageBengaliLabel, generateWhatsAppMessage } from '../../utils/bengali.js';
import smsService from '../../services/sms/sms.service.js';

export class OrdersService {
  /**
   * Create a new multi-item tailoring order.
   */
  async createOrder(
    tailorProfileId: string,
    userId: string,
    data: CreateOrderInput
  ) {
    const deliveryDate = new Date(data.deliveryDate);

    // 1. Check Tailor details & daily capacity
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
    });

    if (!tailor) {
      throw new Error('টেইলার প্রোফাইল পাওয়া যায়নি!');
    }

    // Capacity check for Eid/Rush mode
    const startOfDay = new Date(deliveryDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(deliveryDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingOrdersOnDate = await prisma.order.count({
      where: {
        tailorId: tailorProfileId,
        deliveryDate: { gte: startOfDay, lte: endOfDay },
        status: { notIn: [OrderStatus.CANCELLED, OrderStatus.DELIVERED] },
      },
    });

    let capacityWarning: string | null = null;
    if (existingOrdersOnDate >= tailor.dailyOrderLimit) {
      capacityWarning = `সতর্কতা: ${deliveryDate.toLocaleDateString(
        'bn-BD'
      )} তারিখে ইতিমধ্যে ${existingOrdersOnDate}টি অর্ডার বুকড রয়েছে (দৈনিক সীমা: ${
        tailor.dailyOrderLimit
      })!`;
    }

    // 2. Calculate totals
    const itemsTotal = data.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const totalPrice = Math.max(0, itemsTotal - data.discount);
    const advancePaid = Math.min(totalPrice, data.advancePaid || 0);
    const dueAmount = totalPrice - advancePaid;

    // 3. Generate sequential order number & fabric tag code
    const orderCount = await prisma.order.count({
      where: { tailorId: tailorProfileId },
    });
    const orderNo = generateOrderNumber(orderCount + 1);
    const fabricTagCode = generateFabricTagCode(orderCount + 1);
    const trackingToken = generateRandomToken(24);

    // 4. Create Order & Items in a Transaction
    const createdOrder = await prisma.$transaction(async (tx) => {
      const order = (await tx.order.create({
        data: {
          orderNo,
          tailor: { connect: { id: tailorProfileId } },
          customer: { connect: { id: data.customerId } },
          priority: data.priority,
          deliveryDate,
          originalDeliveryDate: deliveryDate,
          totalPrice: new Prisma.Decimal(totalPrice),
          advancePaid: new Prisma.Decimal(advancePaid),
          discount: new Prisma.Decimal(data.discount),
          notes: data.notes,
          trackingToken,
          fabricTagCode,
          status: OrderStatus.CONFIRMED,
          items: {
            create: data.items.map((item) => ({
              garmentType: { connect: { id: item.garmentTypeId } },
              measurement: item.measurementId ? { connect: { id: item.measurementId } } : undefined,
              quantity: item.quantity,
              price: new Prisma.Decimal(item.price),
              fabricSource: item.fabricSource,
              designNotes: item.designNotes,
              referencePhotoUrls: item.referencePhotoUrls || [],
              selectedStyles: (item.selectedStyles as any) || Prisma.JsonNull,
              assignedWorker: item.assignedWorkerId ? { connect: { id: item.assignedWorkerId } } : undefined,
              pieceRate: item.pieceRate ? new Prisma.Decimal(item.pieceRate) : null,
              stage: ItemStage.FABRIC_RECEIVED,
            })),
          },
        },
        include: {
          items: { include: { garmentType: true } },
          customer: true,
        },
      })) as any;

      // Record stage history for each created item
      for (const item of order.items) {
        await tx.orderStageHistory.create({
          data: {
            orderItemId: item.id,
            fromStage: ItemStage.FABRIC_RECEIVED,
            toStage: ItemStage.FABRIC_RECEIVED,
            changedById: userId,
            note: 'অর্ডার তৈরির সাথে কাপড় গ্রহণ করা হয়েছে',
          },
        });
      }

      // Record Advance Payment if any
      if (advancePaid > 0) {
        await tx.payment.create({
          data: {
            orderId: order.id,
            tailorId: tailorProfileId,
            amount: new Prisma.Decimal(advancePaid),
            method: data.advancePaymentMethod,
            type: PaymentType.ADVANCE,
            trxId: data.advanceTrxId || null,
            note: 'অর্ডারের সময় প্রাপ্ত অগ্রিম টাকা',
          },
        });
      }

      // Update customer total due in TailorCustomer link
      await tx.tailorCustomer.update({
        where: {
          tailorId_customerId: {
            tailorId: tailorProfileId,
            customerId: data.customerId,
          },
        },
        data: {
          totalDue: { increment: dueAmount },
        },
      });

      return order;
    });

    // 5. Generate ready WhatsApp share link
    const trackingUrl = `https://selaisathi.com/track/${createdOrder.trackingToken}`;
    const whatsappText = generateWhatsAppMessage({
      customerName: createdOrder.customer.name,
      shopName: tailor.shopName,
      orderNo: createdOrder.orderNo,
      totalPrice,
      advancePaid,
      dueAmount,
      trackingUrl,
    });

    return {
      order: createdOrder,
      capacityWarning,
      dueAmount,
      trackingUrl,
      whatsappText,
      fabricTagCode,
    };
  }

  /**
   * List orders with filters & search.
   */
  async listOrders(tailorProfileId: string, query: ListOrdersQuery) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      tailorId: tailorProfileId,
    };

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.customerId) where.customerId = query.customerId;

    if (query.search) {
      const search = query.search.trim();
      where.OR = [
        { orderNo: { contains: search, mode: 'insensitive' } },
        { fabricTagCode: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search } } },
      ];
    }

    if (query.startDate && query.endDate) {
      where.deliveryDate = {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      };
    }

    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: { garmentType: true, assignedWorker: true },
          },
          payments: true,
        },
        orderBy: [{ priority: 'desc' }, { deliveryDate: 'asc' }],
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single order details.
   */
  async getOrderById(tailorProfileId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        tailorId: tailorProfileId,
      },
      include: {
        customer: true,
        tailor: true,
        items: {
          include: {
            garmentType: true,
            measurement: true,
            assignedWorker: true,
            stageHistory: { orderBy: { changedAt: 'desc' } },
          },
        },
        payments: { orderBy: { paidAt: 'desc' } },
        changeRequests: true,
      },
    });

    if (!order) {
      throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');
    }

    const totalPaid = order.payments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const dueAmount = Math.max(0, Number(order.totalPrice) - totalPaid);

    return {
      ...order,
      totalPaid,
      dueAmount,
      trackingUrl: `https://selaisathi.com/track/${order.trackingToken}`,
    };
  }

  /**
   * Update stage of a specific order item.
   */
  async updateItemStage(
    tailorProfileId: string,
    orderId: string,
    itemId: string,
    userId: string,
    data: UpdateItemStageInput
  ) {
    const item = await prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId,
        order: { tailorId: tailorProfileId },
      },
      include: {
        order: {
          include: {
            customer: true,
            tailor: true,
            items: true,
          },
        },
        garmentType: true,
      },
    });

    if (!item) {
      throw new Error('অর্ডারের আইটেম খুঁজে পাওয়া যায়নি!');
    }

    const fromStage = item.stage;
    const toStage = data.stage;

    // 1. Update item stage & record history
    const updatedItem = await prisma.$transaction(async (tx) => {
      const updated = await tx.orderItem.update({
        where: { id: itemId },
        data: { stage: toStage },
      });

      await tx.orderStageHistory.create({
        data: {
          orderItemId: itemId,
          fromStage,
          toStage,
          changedById: userId,
          note: data.note || null,
        },
      });

      // 2. Check if all items in this order have reached ready/delivered
      const allItems = await tx.orderItem.findMany({
        where: { orderId },
      });

      const allReady = allItems.every(
        (i) => i.stage === ItemStage.READY || i.stage === ItemStage.DELIVERED
      );
      const allDelivered = allItems.every((i) => i.stage === ItemStage.DELIVERED);

      let newOrderStatus: OrderStatus = OrderStatus.IN_PROGRESS;
      if (allDelivered) {
        newOrderStatus = OrderStatus.DELIVERED;
      } else if (allReady) {
        newOrderStatus = OrderStatus.READY_FOR_DELIVERY;
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: newOrderStatus,
          ...(allDelivered ? { deliveredAt: new Date() } : {}),
        },
      });

      return updated;
    });

    // 3. Send Notification/SMS if requested
    if (data.notifyCustomer) {
      const stageNameBn = getStageBengaliLabel(toStage);
      const message = `[সেলাই সাথী] "${item.order.tailor.shopName}"-এ আপনার অর্ডারের (${item.garmentType.nameBn}) অবস্থা এখন: ${stageNameBn}। বিস্তারিত: https://selaisathi.com/track/${item.order.trackingToken}`;

      smsService.send({
        to: item.order.customer.phone,
        message,
        purpose: 'ORDER_UPDATE',
      }).catch((e) => console.error('Stage change notification error:', e));
    }

    return updatedItem;
  }

  /**
   * Postpone order delivery date with explanation.
   */
  async postponeDelivery(
    tailorProfileId: string,
    orderId: string,
    data: PostponeDeliveryInput
  ) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, tailorId: tailorProfileId },
      include: { customer: true, tailor: true },
    });

    if (!order) {
      throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryDate: new Date(data.newDeliveryDate),
        delayReason: data.delayReason,
      },
    });

    if (data.notifyCustomer) {
      const formattedDate = new Date(data.newDeliveryDate).toLocaleDateString('bn-BD');
      const message = `[সেলাই সাথী] "${order.tailor.shopName}": অনিবার্য কারণে আপনার অর্ডারের (${order.orderNo}) ডেলিভারির নতুন তারিখ ${formattedDate} নির্ধারণ করা হয়েছে। কারণ: ${data.delayReason}।`;

      smsService.send({
        to: order.customer.phone,
        message,
        purpose: 'ORDER_UPDATE',
      }).catch((e) => console.error('Delivery delay SMS error:', e));
    }

    return updated;
  }
}

export const ordersService = new OrdersService();
export default ordersService;
