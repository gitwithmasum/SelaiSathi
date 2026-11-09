import jwt, { SignOptions } from 'jsonwebtoken';
import { Role } from '@prisma/client';
import prisma from '../../config/database.js';
import { config } from '../../config/index.js';
import { normalizeBdPhone } from '../../utils/phone.js';
import {
  generateOtp,
  hashOtp,
  verifyOtpHash,
  generateRandomToken,
  hashToken,
} from '../../utils/crypto.js';
import smsService from '../../services/sms/sms.service.js';

export class AuthService {
  /**
   * Send OTP to phone with rate limits.
   */
  async sendOtp(rawPhone: string) {
    const phone = normalizeBdPhone(rawPhone);
    const now = new Date();

    // 1. Check last request time (must be at least 60 seconds ago)
    const recentRequest = await prisma.otpRequest.findFirst({
      where: {
        phone,
        createdAt: { gte: new Date(now.getTime() - 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (recentRequest) {
      throw new Error('অনুগ্রহ করে ১ মিনিট অপেক্ষা করুন! ঘনঘন ওটিপি পাঠানোর চেষ্টা করবেন না।');
    }

    // 2. Check hourly limit (max 5 requests per hour)
    const hourlyCount = await prisma.otpRequest.count({
      where: {
        phone,
        createdAt: { gte: new Date(now.getTime() - 60 * 60 * 1000) },
      },
    });

    if (hourlyCount >= 5) {
      throw new Error('আপনি এই ঘণ্টায় সর্বোচ্চবার ওটিপি চেষ্টা করেছেন। ১ ঘণ্টা পর চেষ্টা করুন।');
    }

    // 3. Generate 6-digit OTP
    const otp = generateOtp(6);
    const otpHash = hashOtp(phone, otp);
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes validity

    await prisma.otpRequest.create({
      data: {
        phone,
        otpHash,
        expiresAt,
      },
    });

    // 4. Dispatch via SMS Provider
    await smsService.sendOtp(phone, otp);

    return {
      message: 'আপনার মোবাইল নম্বরে ৬ সংখ্যার ওটিপি পাঠানো হয়েছে।',
      phone,
      expiresInSeconds: 300,
    };
  }

  /**
   * Verify OTP and return JWT tokens.
   */
  async verifyOtp(rawPhone: string, otp: string, deviceInfo?: string) {
    const phone = normalizeBdPhone(rawPhone);
    const now = new Date();

    // 1. Find latest active OTP request
    const otpRecord = await prisma.otpRequest.findFirst({
      where: {
        phone,
        isUsed: false,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('ওটিপি এর মেয়াদ শেষ হয়ে গেছে বা নতুন ওটিপি চান।');
    }

    // 2. Lock if attempts > 5
    if (otpRecord.attempts >= 5) {
      throw new Error('অতিরিক্ত ভুল চেষ্টার কারণে এই ওটিপি লক করা হয়েছে। নতুন ওটিপি চান।');
    }

    // 3. Verify OTP Hash
    const isValid = verifyOtpHash(phone, otp, otpRecord.otpHash);
    if (!isValid) {
      await prisma.otpRequest.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      const remainingAttempts = 5 - (otpRecord.attempts + 1);
      throw new Error(`ভুল ওটিপি! আর ${remainingAttempts} বার চেষ্টা করতে পারবেন।`);
    }

    // Mark OTP as used
    await prisma.otpRequest.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // 4. Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
      include: {
        tailorProfile: true,
        customerProfile: true,
      },
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await prisma.user.create({
        data: {
          phone,
          roles: [Role.CUSTOMER],
          currentRole: Role.CUSTOMER,
          lastLoginAt: now,
        },
        include: {
          tailorProfile: true,
          customerProfile: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now },
      });
    }

    // 5. Generate Auth Tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.currentRole, deviceInfo);

    return {
      isNewUser,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        avatarUrl: user.avatarUrl,
        language: user.language,
        roles: user.roles,
        currentRole: user.currentRole,
        tailorProfile: user.tailorProfile,
        customerProfile: user.customerProfile,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    };
  }

  /**
   * Switch or select role.
   */
  async selectRole(userId: string, role: Role) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('ইউজার খুঁজে পাওয়া যায়নি!');
    }

    const updatedRoles = Array.from(new Set([...user.roles, role]));

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: updatedRoles,
        currentRole: role,
      },
      include: {
        tailorProfile: true,
        customerProfile: true,
      },
    });

    const { accessToken, refreshToken } = await this.generateTokens(user.id, role);

    return {
      user: updatedUser,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  /**
   * Refresh Token rotation.
   */
  async refreshAccessToken(rawRefreshToken: string) {
    const tokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new Error('অবৈধ বা মেয়াদোত্তীর্ণ রিফ্রেশ টোকেন! পুনরায় লগইন করুন।');
    }

    // Revoke old token (Rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revokedAt: new Date() },
    });

    // Issue new pair
    const tokens = await this.generateTokens(
      storedToken.userId,
      storedToken.user.currentRole,
      storedToken.deviceInfo || undefined
    );

    return tokens;
  }

  /**
   * Logout (revoke single refresh token).
   */
  async logout(refreshToken: string) {
    const tokenHash = hashToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'সফলভাবে লগআউট হয়েছে।' };
  }

  /**
   * Logout from all devices.
   */
  async logoutAll(userId: string) {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    return { message: 'সকল ডিভাইস থেকে লগআউট সম্পন্ন হয়েছে।' };
  }

  /**
   * Helper to generate JWT pair.
   */
  private async generateTokens(userId: string, role: Role, deviceInfo?: string) {
    const accessSignOptions: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn as unknown as number,
    };
    const accessToken = jwt.sign(
      { userId, role },
      config.jwt.accessSecret,
      accessSignOptions
    );

    const rawRefreshToken = generateRandomToken(48);
    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        deviceInfo: deviceInfo || null,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: rawRefreshToken,
    };
  }
}

export const authService = new AuthService();
export default authService;
