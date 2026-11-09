import { Request, Response } from 'express';
import measurementsService from './measurements.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class MeasurementsController {
  async getGarmentTypes(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      const types = await measurementsService.getGarmentTypes(tailorId);
      return sendSuccess(res, types);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async createGarmentType(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const created = await measurementsService.createCustomGarmentType(tailorId, req.body);
      return sendSuccess(res, created, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getCustomerMeasurements(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const customerId = req.params.customerId as string;
      const items = await measurementsService.getCustomerMeasurements(
        tailorId,
        customerId
      );
      return sendSuccess(res, items);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async save(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const measurement = await measurementsService.saveMeasurement(tailorId, req.body);
      return sendSuccess(res, measurement, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const customerId = req.params.customerId as string;
      const garmentTypeId = req.params.garmentTypeId as string;
      const history = await measurementsService.getMeasurementHistory(
        tailorId,
        customerId,
        garmentTypeId
      );
      return sendSuccess(res, history);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const measurementsController = new MeasurementsController();
export default measurementsController;
