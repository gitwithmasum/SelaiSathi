import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config/index.js';
import prisma from '../config/database.js';
import { sendError } from '../utils/response.js';

export interface AuthUser {
  id: string;
  phone: string;
  roles: Role[];
  currentRole: Role;
  tailorProfileId?: string;
  customerProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'অনুমতি নেই! অনুগ্রহ করে লগইন করুন।', 401, 'UNAUTHORIZED');
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as {
      userId: string;
      role: Role;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        tailorProfile: { select: { id: true } },
        customerProfile: { select: { id: true } },
      },
    });

    if (!user || !user.isActive) {
      sendError(res, 'ইউজার নিষ্ক্রিয় বা খুঁজে পাওয়া যায়নি!', 401, 'USER_INACTIVE');
      return;
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      roles: user.roles,
      currentRole: decoded.role || user.currentRole,
      tailorProfileId: user.tailorProfile?.id,
      customerProfileId: user.customerProfile?.id,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      sendError(res, 'সেশনের মেয়াদ শেষ হয়েছে! পুনরায় লগইন করুন।', 401, 'TOKEN_EXPIRED');
      return;
    }
    sendError(res, 'ভুল টোকেন!', 401, 'INVALID_TOKEN');
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'অনুমোদন প্রয়োজন!', 401, 'UNAUTHORIZED');
      return;
    }

    if (!roles.includes(req.user.currentRole)) {
      sendError(
        res,
        'আপনার এই কাজটি করার অনুমতি নেই!',
        403,
        'FORBIDDEN'
      );
      return;
    }

    next();
  };
}
