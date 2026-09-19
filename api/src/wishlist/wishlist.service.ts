import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: { variants: { orderBy: { price: 'asc' } } },
        },
      },
    });
  }

  async toggle(userId: string, productId: string) {
    const existing = await this.prisma.wishlist.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.wishlist.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { added: false };
    } else {
      await this.prisma.wishlist.create({ data: { userId, productId } });
      return { added: true };
    }
  }

  async remove(userId: string, productId: string) {
    await this.prisma.wishlist.deleteMany({ where: { userId, productId } });
  }
}
