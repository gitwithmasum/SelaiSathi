import { Router } from 'express';
import { paymentsController } from './payments.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import {
  addPaymentSchema,
  addExpenseSchema,
  sendDueReminderSchema,
} from './payments.dto.js';

const router = Router();

// MFS routes (Can be called by authenticated users or public tracking callbacks)
router.post('/mfs/initiate', paymentsController.initiateMfs);
router.post('/mfs/verify', paymentsController.verifyMfs);

// Authenticated tailor routes
router.use(authenticate);
router.use(requireRole(Role.TAILOR));

router.post('/receive', validate(addPaymentSchema), paymentsController.addPayment);
router.post('/expenses', validate(addExpenseSchema), paymentsController.addExpense);
router.get('/reports/daily', paymentsController.getDailyReport);
router.post('/due-reminder', validate(sendDueReminderSchema), paymentsController.sendDueReminder);

export default router;
