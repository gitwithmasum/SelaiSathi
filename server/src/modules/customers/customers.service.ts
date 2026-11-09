import prisma from '../../config/database.js';
import { normalizeBdPhone } from '../../utils/phone.js';
import smsService from '../../services/sms/sms.service.js';
import {
  AddCustomerInput,
  UpdateCustomerInput,
  ListCustomersQuery,
} from './customers.dto.js';

export class CustomersService {
  async listCustomers(tailorProfileId: string, query: ListCustomersQuery) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '20', 10);
    const skip = (page - 1) * limit;

    const where: any = {
      tailorId: tailorProfileId,
    };

    if (query.tag) {
      where.tag = query.tag;
    }

    if (query.hasDueOnly === 'true') {
      where.totalDue = { gt: 0 };
    }

    if (query.search) {
      const search = query.search.trim();
      where.customer = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
        ],
      };
    }

    const [total, items] = await Promise.all([
      prisma.tailorCustomer.count({ where }),
      prisma.tailorCustomer.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              userId: true,
              name: true,
              phone: true,
              gender: true,
              address: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
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

  async getCustomerDetails(tailorProfileId: string, customerId: string) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId,
        },
      },
      include: {
        customer: true,
        measurements: {
          where: { isCurrent: true },
          include: { garmentType: true },
        },
      },
    });

    if (!link) {
      throw new Error('কাস্টমার খুঁজে পাওয়া যায়নি!');
    }

    // Get order history
    const recentOrders = await prisma.order.findMany({
      where: {
        tailorId: tailorProfileId,
        customerId,
      },
      include: {
        items: {
          include: { garmentType: true },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      ...link,
      recentOrders,
    };
  }

  async addCustomer(tailorProfileId: string, data: AddCustomerInput) {
    const phone = normalizeBdPhone(data.phone);

    // 1. Get Tailor shop details for invitation
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
    });

    if (!tailor) {
      throw new Error('টেইলার প্রোফাইল পাওয়া যায়নি!');
    }

    // 2. Find or create CustomerProfile
    let customer = await prisma.customerProfile.findUnique({
      where: { phone },
    });

    if (!customer) {
      customer = await prisma.customerProfile.create({
        data: {
          phone,
          name: data.name,
          gender: data.gender,
          address: data.address,
        },
      });
    }

    // 3. Link customer to tailor
    const link = await prisma.tailorCustomer.upsert({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId: customer.id,
        },
      },
      create: {
        tailorId: tailorProfileId,
        customerId: customer.id,
        tag: data.tag || 'REGULAR',
        notes: data.notes,
      },
      update: {
        tag: data.tag || undefined,
        notes: data.notes || undefined,
      },
      include: {
        customer: true,
      },
    });

    // 4. Send invite SMS if customer doesn't have an active user account yet
    if (data.sendInviteSms && !customer.userId) {
      smsService.sendCustomerInvite({
        customerPhone: phone,
        shopName: tailor.shopName,
        shopCode: tailor.shopCode,
      }).catch((err) => console.error('SMS Invite dispatch error:', err));
    }

    return link;
  }

  async updateCustomer(
    tailorProfileId: string,
    customerId: string,
    data: UpdateCustomerInput
  ) {
    const link = await prisma.tailorCustomer.findUnique({
      where: {
        tailorId_customerId: {
          tailorId: tailorProfileId,
          customerId,
        },
      },
    });

    if (!link) {
      throw new Error('কাস্টমার সম্পর্ক খুঁজে পাওয়া যায়নি!');
    }

    if (data.name || data.gender || data.address) {
      await prisma.customerProfile.update({
        where: { id: customerId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.gender && { gender: data.gender }),
          ...(data.address && { address: data.address }),
        },
      });
    }

    return prisma.tailorCustomer.update({
      where: { id: link.id },
      data: {
        ...(data.tag && { tag: data.tag }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        customer: true,
      },
    });
  }
}

export const customersService = new CustomersService();
export default customersService;
