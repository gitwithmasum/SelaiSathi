import prisma from '../../config/database.js';
import { SubscriptionTier } from '@prisma/client';

export class SubscriptionsService {
  /**
   * Check if a tailor can create an order under their subscription limit.
   */
  async canCreateOrder(tailorProfileId: string): Promise<{
    allowed: boolean;
    reason?: string;
    currentMonthOrders: number;
    tier: SubscriptionTier;
  }> {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
      select: {
        subscriptionTier: true,
        subscriptionEndAt: true,
      },
    });

    if (!tailor) {
      return { allowed: false, reason: 'টেইলার প্রোফাইল পাওয়া যায়নি', currentMonthOrders: 0, tier: SubscriptionTier.FREE };
    }

    const tier = tailor.subscriptionTier;
    const isPro =
      (tier === SubscriptionTier.PRO_MONTHLY || tier === SubscriptionTier.PRO_YEARLY) &&
      (!tailor.subscriptionEndAt || tailor.subscriptionEndAt > new Date());

    if (isPro) {
      return { allowed: true, currentMonthOrders: 0, tier };
    }

    // Free tier: Limit 30 orders per calendar month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const count = await prisma.order.count({
      where: {
        tailorId: tailorProfileId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (count >= 30) {
      return {
        allowed: false,
        reason:
          'ফ্রি প্ল্যানের মাসিক ৩০টি অর্ডারের সীমা শেষ হয়েছে। আনলিমিটেড অর্ডার ও ফিচারের জন্য প্রো প্ল্যানে আপগ্রেড করুন!',
        currentMonthOrders: count,
        tier: SubscriptionTier.FREE,
      };
    }

    return { allowed: true, currentMonthOrders: count, tier: SubscriptionTier.FREE };
  }

  /**
   * Get subscription status & features.
   */
  async getStatus(tailorProfileId: string) {
    const tailor = await prisma.tailorProfile.findUnique({
      where: { id: tailorProfileId },
      select: {
        subscriptionTier: true,
        subscriptionEndAt: true,
        smsCreditsRemaining: true,
      },
    });

    const isPro =
      tailor?.subscriptionTier === SubscriptionTier.PRO_MONTHLY ||
      tailor?.subscriptionTier === SubscriptionTier.PRO_YEARLY;

    return {
      tier: tailor?.subscriptionTier || SubscriptionTier.FREE,
      isPro,
      smsCreditsRemaining: tailor?.smsCreditsRemaining || 0,
      subscriptionEndAt: tailor?.subscriptionEndAt,
      plans: [
        {
          id: 'free',
          name: 'ফ্রি প্ল্যান',
          price: '৳ ০',
          features: ['মাসে ৩০টি অর্ডার', 'ডিজিটাল মাপের খাতা', 'বেসিক রিপোর্ট'],
        },
        {
          id: 'pro_monthly',
          name: 'প্রো মান্থলি',
          price: '৳ ২৯৯ / মাস',
          features: [
            'আনলিমিটেড অর্ডার',
            'এসএমএস নোটিফিকেশন',
            'কারিগর ও খোরাকি খাতা',
            'ঈদ রাশ ক্যাপাসিটি রেডার',
            '৫৮মিমি থার্মাল প্রিন্ট',
          ],
        },
      ],
    };
  }

  /**
   * Upgrade tailor subscription plan.
   */
  async upgradePlan(tailorProfileId: string, tier: SubscriptionTier, durationMonths = 1) {
    const endAt = new Date();
    endAt.setMonth(endAt.getMonth() + durationMonths);

    return prisma.tailorProfile.update({
      where: { id: tailorProfileId },
      data: {
        subscriptionTier: tier,
        subscriptionEndAt: endAt,
        smsCreditsRemaining: { increment: 100 }, // Bonus 100 SMS credits on Pro
      },
    });
  }
}

export const subscriptionsService = new SubscriptionsService();
export default subscriptionsService;
