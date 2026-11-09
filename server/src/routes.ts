import { Router } from 'express';
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import customersRoutes from './modules/customers/customers.routes.js';
import measurementsRoutes from './modules/measurements/measurements.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import paymentsRoutes from './modules/payments/payments.routes.js';
import workersRoutes from './modules/workers/workers.routes.js';
import customerPortalRoutes from './modules/customerPortal/customerPortal.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import chatRoutes from './modules/chat/chat.routes.js';
import calendarRoutes from './modules/calendar/calendar.routes.js';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    app: 'SelaiSathi (সেলাই সাথী) Backend API',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

// Mounted modules
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/customers', customersRoutes);
router.use('/measurements', measurementsRoutes);
router.use('/orders', ordersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/workers', workersRoutes);
router.use('/portal', customerPortalRoutes);
router.use('/public', publicRoutes);
router.use('/chat', chatRoutes);
router.use('/calendar', calendarRoutes);

export default router;
