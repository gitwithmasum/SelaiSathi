import { Request, Response } from 'express';
import chatService from './chat.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class ChatController {
  async getMessages(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const orderId = req.params.orderId as string;

      const result = await chatService.getMessages(
        orderId,
        req.user.id,
        req.query as any
      );
      return sendSuccess(res, result.items, 200, {
        ...result.meta,
        quickReplies: result.quickReplies,
      });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const orderId = req.params.orderId as string;

      const message = await chatService.sendMessage(
        orderId,
        req.user.id,
        req.body
      );
      return sendSuccess(res, message, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const orderId = req.params.orderId as string;

      await chatService.markAsRead(orderId, req.user.id);
      return sendSuccess(res, { message: 'পঠিত হিসেবে চিহ্নিত হয়েছে।' });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async getQuickReplies(_req: Request, res: Response) {
    const replies = chatService.getQuickReplies();
    return sendSuccess(res, replies);
  }
}

export const chatController = new ChatController();
export default chatController;
