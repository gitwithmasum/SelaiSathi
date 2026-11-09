import prisma from '../../config/database.js';
import { generateShopCode } from '../../utils/crypto.js';
import {
  UpdateProfileInput,
  TailorProfileSetupInput,
  CustomerProfileSetupInput,
} from './users.dto.js';
import { Role, Prisma } from '@prisma/client';

export class UsersService {
  async getFullProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tailorProfile: true,
        customerProfile: true,
      },
    });

    if (!user) {
      throw new Error('ইউজার খুঁজে পাওয়া যায়নি!');
    }

    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileInput) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.language && { language: data.language }),
        ...(data.fcmToken && { fcmToken: data.fcmToken }),
      },
    });
  }

  async setupTailorProfile(userId: string, data: TailorProfileSetupInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { tailorProfile: true },
    });

    if (!user) {
      throw new Error('ইউজার খুঁজে পাওয়া যায়নি!');
    }

    // Ensure shop code is unique
    let shopCode = generateShopCode('SS');
    let attempts = 0;
    while (attempts < 5) {
      const existing = await prisma.tailorProfile.findUnique({ where: { shopCode } });
      if (!existing) break;
      shopCode = generateShopCode('SS');
      attempts++;
    }

    // Update or create tailor profile
    const tailorProfile = await prisma.tailorProfile.upsert({
      where: { userId },
      create: {
        userId,
        shopName: data.shopName,
        shopCode,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openingHours: (data.openingHours as any) || Prisma.JsonNull,
        logoUrl: data.logoUrl,
        dailyOrderLimit: data.dailyOrderLimit || 15,
      },
      update: {
        shopName: data.shopName,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        openingHours: (data.openingHours as any) || Prisma.JsonNull,
        logoUrl: data.logoUrl,
        dailyOrderLimit: data.dailyOrderLimit || 15,
      },
    });

    // Ensure user has TAILOR role
    if (!user.roles.includes(Role.TAILOR)) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          roles: { set: [...user.roles, Role.TAILOR] },
          currentRole: Role.TAILOR,
        },
      });
    }

    return tailorProfile;
  }

  async setupCustomerProfile(userId: string, data: CustomerProfileSetupInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('ইউজার খুঁজে পাওয়া যায়নি!');
    }

    // Check if a customer profile was already created earlier by a tailor using this phone number
    const existingByPhone = await prisma.customerProfile.findUnique({
      where: { phone: user.phone },
    });

    let customerProfile;
    if (existingByPhone) {
      // Link to this registered user
      customerProfile = await prisma.customerProfile.update({
        where: { id: existingByPhone.id },
        data: {
          userId,
          name: data.name || existingByPhone.name,
          gender: data.gender || existingByPhone.gender,
          address: data.address || existingByPhone.address,
        },
      });
    } else {
      customerProfile = await prisma.customerProfile.create({
        data: {
          userId,
          phone: user.phone,
          name: data.name,
          gender: data.gender,
          address: data.address,
        },
      });
    }

    // Also update user display name if not set
    if (!user.name && data.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: data.name },
      });
    }

    return customerProfile;
  }
}

export const usersService = new UsersService();
export default usersService;

