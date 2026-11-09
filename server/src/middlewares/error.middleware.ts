import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled Server Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const target = (err.meta?.target as string[])?.join(', ') || 'field';
    sendError(
      res,
      `এই তথ্যটি (${target}) ইতিমধ্যে সিস্টেমে বিদ্যমান!`,
      409,
      'CONFLICT'
    );
    return;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    sendError(res, 'কাঙ্ক্ষিত রেকর্ডটি খুঁজে পাওয়া যায়নি!', 404, 'NOT_FOUND');
    return;
  }

  const message =
    err.message || 'সার্ভারে অভ্যন্তরীণ ত্রুটি ঘটেছে! কিছু সময় পর আবার চেষ্টা করুন।';
  const statusCode = err.statusCode || 500;

  sendError(res, message, statusCode, 'INTERNAL_SERVER_ERROR');
}
