import { z } from 'zod';
import { ChatMessageType } from '@prisma/client';

export const sendMessageSchema = z.object({
  body: z.string().optional(),
  type: z.enum([
    ChatMessageType.TEXT,
    ChatMessageType.IMAGE,
    ChatMessageType.VOICE,
    ChatMessageType.SYSTEM,
  ]).default(ChatMessageType.TEXT),
  mediaUrl: z.string().url().optional(),
  durationSec: z.number().int().min(1).max(300).optional(), // Max 5 mins for voice note
});

export const listMessagesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional().default('1'),
  limit: z.string().regex(/^\d+$/).optional().default('50'),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
