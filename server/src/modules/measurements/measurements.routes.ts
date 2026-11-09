import { Router } from 'express';
import { measurementsController } from './measurements.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  saveMeasurementSchema,
  createGarmentTypeSchema,
} from './measurements.dto.js';

const router = Router();

router.use(authenticate);

router.get('/garment-types', measurementsController.getGarmentTypes);
router.post('/garment-types', validate(createGarmentTypeSchema), measurementsController.createGarmentType);
router.get('/customer/:customerId', measurementsController.getCustomerMeasurements);
router.get('/customer/:customerId/history/:garmentTypeId', measurementsController.getHistory);
router.post('/', validate(saveMeasurementSchema), measurementsController.save);

export default router;
