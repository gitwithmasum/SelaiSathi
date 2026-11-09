import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  tailorProfileSetupSchema,
  customerProfileSetupSchema,
} from './users.dto.js';

const router = Router();

router.use(authenticate);

router.get('/profile', usersController.getProfile);
router.patch('/profile', validate(updateProfileSchema), usersController.updateProfile);
router.post('/tailor-profile', validate(tailorProfileSetupSchema), usersController.setupTailorProfile);
router.post('/customer-profile', validate(customerProfileSetupSchema), usersController.setupCustomerProfile);

export default router;
