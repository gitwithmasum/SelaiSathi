import { Request, Response } from 'express';
import calendarService from './calendar.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class CalendarController {
  async getMonthlyWorkload(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = parseInt(req.query.month as string, 10) || new Date().getMonth() + 1;

      const result = await calendarService.getMonthlyWorkload(tailorId, year, month);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getTrialSlots(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const dateStr = req.query.date as string | undefined;
      const slots = await calendarService.getTrialSlots(tailorId, dateStr);
      return sendSuccess(res, slots);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async createTrialSlot(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const slot = await calendarService.createTrialSlot(tailorId, req.body);
      return sendSuccess(res, slot, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async bookTrialSlot(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const booking = await calendarService.bookTrialSlot(req.user.id, req.body);
      return sendSuccess(res, booking, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async addHoliday(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const holiday = await calendarService.addHoliday(tailorId, req.body);
      return sendSuccess(res, holiday, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const calendarController = new CalendarController();
export default calendarController;
