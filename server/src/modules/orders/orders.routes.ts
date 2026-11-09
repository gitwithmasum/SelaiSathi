import { Router } from 'express';
import { ordersController } from './orders.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import {
  createOrderSchema,
  updateItemStageSchema,
  postponeDeliverySchema,
  listOrdersQuerySchema,
} from './orders.dto.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.TAILOR));

router.get('/', validateQuery(listOrdersQuerySchema), ordersController.list);
router.post('/', validate(createOrderSchema), ordersController.create);
router.get('/:id', ordersController.getById);
router.patch('/:id/items/:itemId/stage', validate(updateItemStageSchema), ordersController.updateItemStage);
router.patch('/:id/postpone', validate(postponeDeliverySchema), ordersController.postponeDelivery);

export default router;
