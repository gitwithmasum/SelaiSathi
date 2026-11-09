import { Router } from 'express';
import { reviewsController } from './reviews.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import { createReviewSchema, replyReviewSchema } from './reviews.dto.js';

const router = Router();

// Public / Authenticated list reviews for a tailor
router.get('/', reviewsController.listTailorReviews);

// Authenticated actions
router.use(authenticate);

// Customer writes review
router.post('/', validate(createReviewSchema), reviewsController.createReview);

// Tailor replies to review
router.patch(
  '/:id/reply',
  requireRole(Role.TAILOR),
  validate(replyReviewSchema),
  reviewsController.replyReview
);

export default router;
