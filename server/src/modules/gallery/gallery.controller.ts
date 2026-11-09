import { Request, Response } from 'express';
import galleryService from './gallery.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export class GalleryController {
  async list(req: Request, res: Response) {
    try {
      const tailorId =
        (req.query.tailorId as string) || req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার আইডি প্রয়োজন!', 400);

      const items = await galleryService.listItems(
        tailorId,
        req.query.category as string
      );
      return sendSuccess(res, items);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async create(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const item = await galleryService.createItem(tailorId, req.body);
      return sendSuccess(res, item, 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const tailorId = req.user?.tailorProfileId;
      if (!tailorId) return sendError(res, 'টেইলার প্রোফাইল প্রয়োজন!', 403);

      const itemId = req.params.id as string;
      await galleryService.deleteItem(tailorId, itemId);
      return sendSuccess(res, { message: 'ছবিটি সফলভাবে ডিলিট হয়েছে।' });
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }

  async toggleFavorite(req: Request, res: Response) {
    try {
      if (!req.user) return sendError(res, 'অনুমোদন প্রয়োজন!', 401);
      const itemId = req.params.id as string;
      const result = await galleryService.toggleFavorite(req.user.id, itemId);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
}

export const galleryController = new GalleryController();
export default galleryController;
