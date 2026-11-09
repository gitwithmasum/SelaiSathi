import { Request, Response } from 'express';
import ordersService from './orders.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class OrdersController {
  async create(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      const userId = req.user?.id;
      if (!tailorId || !userId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await ordersService.createOrder(tailorId, userId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async list(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await ordersService.listOrders(tailorId, req.query as any);
      return sendSuccess(res, result.items, 200, result.meta);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const orderId = req.params.id as string;
      const result = await ordersService.getOrderById(tailorId, orderId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  async updateItemStage(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      const userId = req.user?.id;
      if (!tailorId || !userId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const orderId = req.params.id as string;
      const itemId = req.params.itemId as string;

      const result = await ordersService.updateItemStage(
        tailorId,
        orderId,
        itemId,
        userId,
        req.body
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async postponeDelivery(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const orderId = req.params.id as string;
      const result = await ordersService.postponeDelivery(
        tailorId,
        orderId,
        req.body
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const ordersController = new OrdersController();
export default ordersController;
