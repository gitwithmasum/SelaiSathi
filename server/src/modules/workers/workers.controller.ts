import { Request, Response } from 'express';
import workersService from './workers.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class WorkersController {
  async list(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const workers = await workersService.listWorkers(tailorId);
      return sendSuccess(res, workers);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const worker = await workersService.createWorker(tailorId, req.body);
      return sendSuccess(res, worker, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async recordPayment(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const payment = await workersService.recordPayment(tailorId, req.body);
      return sendSuccess(res, payment, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const workersController = new WorkersController();
export default workersController;
