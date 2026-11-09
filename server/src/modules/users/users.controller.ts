import { Request, Response } from 'express';
import usersService from './users.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class UsersController {
  async getProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const profile = await usersService.getFullProfile(req.user.id);
      return sendSuccess(res, profile);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const updated = await usersService.updateProfile(req.user.id, req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async setupTailorProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const profile = await usersService.setupTailorProfile(req.user.id, req.body);
      return sendSuccess(res, profile, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async setupCustomerProfile(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const profile = await usersService.setupCustomerProfile(req.user.id, req.body);
      return sendSuccess(res, profile, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const usersController = new UsersController();
export default usersController;
