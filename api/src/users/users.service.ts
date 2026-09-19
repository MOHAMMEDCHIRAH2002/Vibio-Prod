import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          role: true,
          image: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { items: true },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: { name?: string; phone?: string; image?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, phone: true, image: true },
    });
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.create({ data: { ...data, userId } });
  }

  async updateAddress(addressId: string, userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return this.prisma.address.update({
      where: { id: addressId },
      data,
    });
  }

  async deleteAddress(addressId: string, userId: string) {
    await this.prisma.address.delete({
      where: { id: addressId, userId },
    });
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({ where: { userId } });
  }
}
