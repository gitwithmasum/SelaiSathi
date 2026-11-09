import { Request, Response } from 'express';
import customerPortalService from './customerPortal.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class CustomerPortalController {
  async getMyOrders(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const orders = await customerPortalService.getMyOrders(req.user.id);
      return sendSuccess(res, orders);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getMyMeasurements(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const measurements = await customerPortalService.getMyMeasurements(req.user.id);
      return sendSuccess(res, measurements);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async joinShop(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const result = await customerPortalService.joinShopByCode(req.user.id, req.body);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async submitOrderRequest(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const result = await customerPortalService.submitOrderRequest(req.user.id, req.body);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const customerPortalController = new CustomerPortalController();
export default customerPortalController;
