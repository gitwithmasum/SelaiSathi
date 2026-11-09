import { Router } from 'express';
import { workersController } from './workers.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import { createWorkerSchema, recordWorkerPaymentSchema } from './workers.dto.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.TAILOR));

router.get('/', workersController.list);
router.post('/', validate(createWorkerSchema), workersController.create);
router.post('/payments', validate(recordWorkerPaymentSchema), workersController.recordPayment);

export default router;
