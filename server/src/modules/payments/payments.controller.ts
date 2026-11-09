import { Request, Response } from 'express';
import paymentsService from './payments.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class PaymentsController {
  async addPayment(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await paymentsService.addPayment(tailorId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async addExpense(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await paymentsService.addExpense(tailorId, req.body);
      return sendSuccess(res, result, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getDailyReport(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const dateStr = req.query.date as string | undefined;
      const report = await paymentsService.getDailyReport(tailorId, dateStr);
      return sendSuccess(res, report);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async sendDueReminder(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const result = await paymentsService.sendDueReminder(
        tailorId,
        req.body.customerId
      );
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const paymentsController = new PaymentsController();
export default paymentsController;
