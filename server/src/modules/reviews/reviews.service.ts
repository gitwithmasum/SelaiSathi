import prisma from '../../config/database.js';
import { CreateReviewInput, ReplyReviewInput } from './reviews.dto.js';
import { Prisma } from '@prisma/client';

export class ReviewsService {
  /**
   * Customer submits review for their delivered order.
   */
  async createReview(userId: string, data: CreateReviewInput) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');

    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { review: true },
    });

    if (!order) throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');
    if (order.customerId !== customer.id) {
      throw new Error('এই অর্ডারে রিভিউ দেওয়ার অনুমতি আপনার নেই!');
    }
    if (order.review) {
      throw new Error('এই অর্ডারে ইতিমধ্যে রিভিউ প্রদান করা হয়েছে!');
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create review
      const rev = await tx.review.create({
        data: {
          orderId: data.orderId,
          customerId: customer.id,
          tailorId: order.tailorId,
          rating: data.rating,
          comment: data.comment || null,
        },
      });

      // 2. Recalculate average rating for tailor
      const agg = await tx.review.aggregate({
        where: { tailorId: order.tailorId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.tailorProfile.update({
        where: { id: order.tailorId },
        data: {
          ratingAvg: new Prisma.Decimal((agg._avg.rating || data.rating).toFixed(2)),
          ratingCount: agg._count.rating || 1,
        },
      });

      return rev;
    });
  }

  /**
   * Tailor replies to customer review.
   */
  async replyReview(tailorProfileId: string, reviewId: string, data: ReplyReviewInput) {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review || review.tailorId !== tailorProfileId) {
      throw new Error('রিভিউটি খুঁজে পাওয়া যায়নি!');
    }

    return prisma.review.update({
      where: { id: reviewId },
      data: {
        tailorReply: data.tailorReply,
      },
    });
  }

  /**
   * List reviews for a tailor shop.
   */
  async listTailorReviews(tailorProfileId: string) {
    return prisma.review.findMany({
      where: { tailorId: tailorProfileId },
      include: {
        customer: { select: { name: true } },
        order: { select: { orderNo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;
