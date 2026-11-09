import { Request, Response } from 'express';
import reviewsService from './reviews.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class ReviewsController {
  async createReview(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const review = await reviewsService.createReview(req.user.id, req.body);
      return sendSuccess(res, review, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async replyReview(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const reviewId = req.params.id as string;
      const updated = await reviewsService.replyReview(tailorId, reviewId, req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async listTailorReviews(req: Request, res: Response) {
    try {
      const tailorId = (req.query.tailorId as string) || req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার আইডি প্রয়োজন!', 400);

      const list = await reviewsService.listTailorReviews(tailorId);
      return sendSuccess(res, list);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const reviewsController = new ReviewsController();
export default reviewsController;
