import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { sendError } from '../utils/response.js';

export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'তথ্য সঠিকভাবে পূরণ করুন!', 422, 'VALIDATION_ERROR', details);
        return;
      }
      sendError(res, 'ভুল ইনপুট ডেটা!', 400, 'BAD_REQUEST');
    }
  };
}

export function validateQuery(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = (await schema.parseAsync(req.query)) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        sendError(res, 'সার্চ বা ফিল্টার প্যারামিটার ভুল!', 422, 'QUERY_VALIDATION_ERROR', details);
        return;
      }
      sendError(res, 'ভুল কুয়েরি প্যারামিটার!', 400, 'BAD_REQUEST');
    }
  };
}
