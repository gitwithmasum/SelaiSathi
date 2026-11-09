import { Router } from 'express';
import { customersController } from './customers.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';
import { validate, validateQuery } from '../../middlewares/validate.middleware.js';
import { Role } from '@prisma/client';
import {
  addCustomerSchema,
  updateCustomerSchema,
  listCustomersQuerySchema,
} from './customers.dto.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(Role.TAILOR));

router.get('/', validateQuery(listCustomersQuerySchema), customersController.list);
router.get('/:id', customersController.getById);
router.post('/', validate(addCustomerSchema), customersController.add);
router.patch('/:id', validate(updateCustomerSchema), customersController.update);

export default router;
