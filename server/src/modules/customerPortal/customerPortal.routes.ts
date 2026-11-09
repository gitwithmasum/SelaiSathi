import { Router } from 'express';
import { customerPortalController } from './customerPortal.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { joinShopSchema, orderRequestSchema } from './customerPortal.dto.js';

const router = Router();

router.use(authenticate);

router.get('/my/orders', customerPortalController.getMyOrders);
router.get('/my/measurements', customerPortalController.getMyMeasurements);
router.post('/tailors/join', validate(joinShopSchema), customerPortalController.joinShop);
router.post('/order-requests', validate(orderRequestSchema), customerPortalController.submitOrderRequest);

export default router;
