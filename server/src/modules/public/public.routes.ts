import { Router } from 'express';
import { publicController } from './public.controller.js';

const router = Router();

// Public unauthenticated tracking route
router.get('/track/:token', publicController.trackOrder);

export default router;
