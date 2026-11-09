import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { sendMessageSchema } from './chat.dto.js';

const router = Router();

router.use(authenticate);

router.get('/quick-replies', chatController.getQuickReplies);
router.get('/:orderId/messages', chatController.getMessages);
router.post('/:orderId/messages', validate(sendMessageSchema), chatController.sendMessage);
router.patch('/:orderId/read', chatController.markAsRead);

export default router;
