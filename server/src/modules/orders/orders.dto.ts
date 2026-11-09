import { z } from 'zod';
import {
  FabricSource,
  ItemStage,
  OrderPriority,
  OrderStatus,
  PaymentMethod,
} from '@prisma/client';

export const createOrderItemSchema = z.object({
  garmentTypeId: z.string().uuid('পোশাকের ধরন নির্বাচন করুন'),
  measurementId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).default(1),
  price: z.number().min(0, 'সঠিক মূল্য দিন'),
  fabricSource: z.enum([FabricSource.CUSTOMER, FabricSource.SHOP]).default(FabricSource.CUSTOMER),
  designNotes: z.string().optional(),
  referencePhotoUrls: z.array(z.string().url()).optional().default([]),
  selectedStyles: z.record(z.any()).optional(), // e.g. { collar: "Band", pocket: "Double" }
  assignedWorkerId: z.string().uuid().optional(),
  pieceRate: z.number().min(0).optional(),
});

export const createOrderSchema = z.object({
  customerId: z.string().uuid('কাস্টমার নির্বাচন করুন'),
  deliveryDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  priority: z.enum([OrderPriority.NORMAL, OrderPriority.URGENT]).default(OrderPriority.NORMAL),
  items: z.array(createOrderItemSchema).min(1, 'কমপক্ষে একটি আইটেম যোগ করুন'),
  discount: z.number().min(0).default(0),
  advancePaid: z.number().min(0).default(0),
  advancePaymentMethod: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BKASH,
    PaymentMethod.NAGAD,
    PaymentMethod.BANK,
    PaymentMethod.OTHER,
  ]).default(PaymentMethod.CASH),
  advanceTrxId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateItemStageSchema = z.object({
  stage: z.enum([
    ItemStage.FABRIC_RECEIVED,
    ItemStage.CUTTING,
    ItemStage.STITCHING,
    ItemStage.FINISHING_IRONING,
    ItemStage.TRIAL,
    ItemStage.READY,
    ItemStage.DELIVERED,
    ItemStage.CANCELLED,
  ]),
  note: z.string().optional(),
  notifyCustomer: z.boolean().optional().default(true),
});

export const postponeDeliverySchema = z.object({
  newDeliveryDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  delayReason: z.string().min(3, 'ডেলিভারি পেছানোর কারণ উল্লেখ করুন'),
  notifyCustomer: z.boolean().optional().default(true),
});

export const listOrdersQuerySchema = z.object({
  status: z.enum([
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.IN_PROGRESS,
    OrderStatus.READY_FOR_TRIAL,
    OrderStatus.READY_FOR_DELIVERY,
    OrderStatus.DELIVERED,
    OrderStatus.CANCELLED,
  ]).optional(),
  priority: z.enum([OrderPriority.NORMAL, OrderPriority.URGENT]).optional(),
  customerId: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('20'),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateItemStageInput = z.infer<typeof updateItemStageSchema>;
export type PostponeDeliveryInput = z.infer<typeof postponeDeliverySchema>;
export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
