import { Request, Response } from 'express';
import customersService from './customers.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class CustomersController {
  async list(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await customersService.listCustomers(tailorId, req.query as any);
      return sendSuccess(res, result.items, 200, result.meta);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const customerId = req.params.id as string;
      const result = await customersService.getCustomerDetails(
        tailorId,
        customerId
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 404);
    }
  }

  async add(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await customersService.addCustomer(tailorId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const customerId = req.params.id as string;
      const result = await customersService.updateCustomer(
        tailorId,
        customerId,
        req.body
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const customersController = new CustomersController();
export default customersController;
