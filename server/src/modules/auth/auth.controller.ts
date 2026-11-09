import { Request, Response } from 'express';
import authService from './auth.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class AuthController {
  async sendOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      const result = await authService.sendOtp(phone);
      return sendSuccess(res, result, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, otp, deviceInfo } = req.body;
      const result = await authService.verifyOtp(phone, otp, deviceInfo);
      return sendSuccess(res, result, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async selectRole(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      }
      const { role } = req.body;
      const result = await authService.selectRole(req.user.id, role);
      return sendSuccess(res, result, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshAccessToken(refreshToken);
      return sendSuccess(res, tokens, 200);
    } catch (err: any) {
      return sendError(res, err.message, 401);
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      return sendSuccess(res, { message: 'সফলভাবে লগআউট হয়েছে।' }, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async logoutAll(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      }
      const result = await authService.logoutAll(req.user.id);
      return sendSuccess(res, result, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      if (!req.user) {
        return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      }
      return sendSuccess(res, { user: req.user }, 200);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const authController = new AuthController();
export default authController;
