import { Router } from 'express';
import { calendarController } from './calendar.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import {
  createTrialSlotSchema,
  bookTrialSchema,
  addHolidaySchema,
} from './calendar.dto.js';

const router = Router();

router.use(authenticate);

// Workload & trial slots (Tailor)
router.get('/workload', requireRole(Role.TAILOR), calendarController.getMonthlyWorkload);
router.get('/trial-slots', calendarController.getTrialSlots);
router.post('/trial-slots', requireRole(Role.TAILOR), validate(createTrialSlotSchema), calendarController.createTrialSlot);
router.post('/holidays', requireRole(Role.TAILOR), validate(addHolidaySchema), calendarController.addHoliday);

// Customer booking
router.post('/book-trial', validate(bookTrialSchema), calendarController.bookTrialSlot);

export default router;
