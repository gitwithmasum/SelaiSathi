import { Router } from 'express';
import { galleryController } from './gallery.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import { createGalleryItemSchema } from './gallery.dto.js';

const router = Router();

// Public / Authenticated catalog browse
router.get('/', galleryController.list);

// Authenticated customer/tailor actions
router.use(authenticate);

router.post(
  '/',
  requireRole(Role.TAILOR),
  validate(createGalleryItemSchema),
  galleryController.create
);

router.delete(
  '/:id',
  requireRole(Role.TAILOR),
  galleryController.delete
);

router.post(
  '/:id/favorite',
  galleryController.toggleFavorite
);

export default router;
