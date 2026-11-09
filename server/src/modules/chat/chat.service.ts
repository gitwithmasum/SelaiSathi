import prisma from '../../config/database.js';
import { SendMessageInput, ListMessagesQuery } from './chat.dto.js';
import { ChatMessageType } from '@prisma/client';

export class ChatService {
  /**
   * Pre-set fast messages for tailors to reply without typing.
   */
  getQuickReplies() {
    return [
      { id: 'qr_1', text: 'আপনার কাপড় ও অর্ডারের বিবরণ পেয়েছি।' },
      { id: 'qr_2', text: 'আপনার কাটিং ও সেলাই কাজ শুরু হয়েছে।' },
      { id: 'qr_3', text: 'আগামীকাল ট্রায়ালের জন্য দোকানে আসার অনুরোধ করছি।' },
      { id: 'qr_4', text: 'আপনার পোশাক তৈরি সম্পন্ন! যেকোনো সময় এসে নিতে পারেন।' },
      { id: 'qr_5', text: 'মাপ কি আপনার আগের অর্ডারের মতোই থাকবে?' },
    ];
  }

  /**
   * Verify if user belongs to this order as tailor or customer.
   */
  private async verifyOrderAccess(orderId: string, userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tailorProfile: true,
        customerProfile: true,
      },
    });

    if (!user) throw new Error('ইউজার খুঁজে পাওয়া যায়নি!');

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        tailor: true,
        customer: true,
      },
    });

    if (!order) throw new Error('অর্ডার খুঁজে পাওয়া যায়নি!');

    const isTailor = order.tailorId === user.tailorProfile?.id;
    const isCustomer = order.customerId === user.customerProfile?.id;

    if (!isTailor && !isCustomer) {
      throw new Error('এই অর্ডারের চ্যাট দেখার অনুমতি আপনার নেই!');
    }

    return { order, user, isTailor };
  }

  /**
   * Get all messages for an order thread.
   */
  async getMessages(orderId: string, userId: string, query: ListMessagesQuery) {
    await this.verifyOrderAccess(orderId, userId);

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      prisma.chatMessage.count({ where: { orderId } }),
      prisma.chatMessage.findMany({
        where: { orderId },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              currentRole: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      quickReplies: this.getQuickReplies(),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Send a new message (Text, Audio Voice Note, Image).
   */
  async sendMessage(orderId: string, senderId: string, data: SendMessageInput) {
    await this.verifyOrderAccess(orderId, senderId);

    if (!data.body && !data.mediaUrl) {
      throw new Error('মেসেজের টেক্সট বা মিডিয়া প্রদান করুন!');
    }

    return prisma.chatMessage.create({
      data: {
        orderId,
        senderId,
        type: data.type || ChatMessageType.TEXT,
        body: data.body || null,
        mediaUrl: data.mediaUrl || null,
        durationSec: data.durationSec || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            currentRole: true,
          },
        },
      },
    });
  }

  /**
   * Mark messages as read.
   */
  async markAsRead(orderId: string, userId: string) {
    await this.verifyOrderAccess(orderId, userId);

    return prisma.chatMessage.updateMany({
      where: {
        orderId,
        senderId: { not: userId },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });
  }
}

export const chatService = new ChatService();
export default chatService;
