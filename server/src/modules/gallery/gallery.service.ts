import prisma from '../../config/database.js';
import { CreateGalleryItemInput } from './gallery.dto.js';

export class GalleryService {
  async listItems(tailorProfileId: string, category?: string) {
    const where: any = { tailorId: tailorProfileId };
    if (category && category !== 'ALL') {
      where.category = category;
    }

    return prisma.galleryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createItem(tailorProfileId: string, data: CreateGalleryItemInput) {
    return prisma.galleryItem.create({
      data: {
        tailorId: tailorProfileId,
        imageUrl: data.imageUrl,
        category: data.category,
        caption: data.caption || null,
      },
    });
  }

  async deleteItem(tailorProfileId: string, itemId: string) {
    return prisma.galleryItem.deleteMany({
      where: {
        id: itemId,
        tailorId: tailorProfileId,
      },
    });
  }

  async toggleFavorite(userId: string, galleryItemId: string) {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId },
    });

    if (!customer) throw new Error('কাস্টমার প্রোফাইল পাওয়া যায়নি!');

    const existing = await prisma.favorite.findUnique({
      where: {
        customerId_galleryItemId: {
          customerId: customer.id,
          galleryItemId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { isFavorite: false };
    } else {
      await prisma.favorite.create({
        data: {
          customerId: customer.id,
          galleryItemId,
        },
      });
      return { isFavorite: true };
    }
  }
}

export const galleryService = new GalleryService();
export default galleryService;
