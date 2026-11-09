import prisma from '../../config/database.js';
import { JoinShopInput, OrderRequestInput } from './customerPortal.dto.js';

export class CustomerPortalService {
  /**
   * Get all orders belonging to logged-in customer.
   */
  async getMyOrders(userId: string) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');
    }

    return prisma.order.findMany({
      where: { customerId: customer.id },
      include: {
        tailor: {
          select: {
            id: true,
            shopName: true,
            shopCode: true,
            logoUrl: true,
            address: true,
          },
        },
        items: {
          include: { garmentType: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all measurements for logged-in customer.
   */
  async getMyMeasurements(userId: string) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');
    }

    return prisma.measurement.findMany({
      where: {
        tailorCustomer: { customerId: customer.id },
        isCurrent: true,
      },
      include: {
        garmentType: true,
        tailorCustomer: {
          include: {
            tailor: { select: { shopName: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Join a tailor shop using unique shop code or QR.
   */
  async joinShopByCode(userId: string, data: JoinShopInput) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');
    }

    const tailor = await prisma.tailorProfile.findUnique({
      where: { shopCode: data.shopCode.trim() },
    });

    if (!tailor) {
      throw new Error('ভুল শপ কোড! এই কোডের কোনো টেইলার শপ পাওয়া যায়নি।');
    }

    // Link customer to tailor
    const link = await prisma.tailorCustomer.upsert({
      where: {
        tailorId_customerId: {
          tailorId: tailor.id,
          customerId: customer.id,
        },
      },
      create: {
        tailorId: tailor.id,
        customerId: customer.id,
        tag: 'REGULAR',
      },
      update: {},
      include: {
        tailor: true,
      },
    });

    return {
      message: `আপনি সফলভাবে "${tailor.shopName}"-এর সাথে যুক্ত হয়েছেন।`,
      shop: tailor,
      link,
    };
  }

  /**
   * Submit custom order request.
   */
  async submitOrderRequest(userId: string, data: OrderRequestInput) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) {
      throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');
    }

    return prisma.orderRequest.create({
      data: {
        customerId: customer.id,
        tailorId: data.tailorId,
        details: data.details,
        photoUrls: data.photoUrls,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
      },
    });
  }
}

export const customerPortalService = new CustomerPortalService();
export default customerPortalService;
