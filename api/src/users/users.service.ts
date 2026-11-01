import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcryptjs';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          role: 'CUSTOMER' as const,
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : { role: 'CUSTOMER' as const };

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

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, image: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        phone: data.phone,
        image: data.image,
      },
      select: { id: true, email: true, name: true, phone: true, image: true },
    });
  }

  async changePassword(userId: string, data: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });
    if (!user?.passwordHash || !(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
      throw new BadRequestException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(data.newPassword, 12);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
    return { message: 'Password changed successfully' };
  }

  async addAddress(userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const address = await this.prisma.address.create({
      data: {
        userId,
        fullName: this.getAddressFullName(data),
        phone: data.phone || '',
        line1: data.line1 || data.address1,
        line2: data.line2 ?? data.address2 ?? null,
        city: data.city,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country,
        isDefault: Boolean(data.isDefault),
      },
    });
    return this.toAddressResponse(address);
  }

  async updateAddress(addressId: string, userId: string, data: any) {
    if (data.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const address = await this.prisma.address.update({
      where: { id: addressId, userId },
      data: {
        fullName: this.getAddressFullName(data),
        phone: data.phone || '',
        line1: data.line1 || data.address1,
        line2: data.line2 ?? data.address2 ?? null,
        city: data.city,
        state: data.state || null,
        postalCode: data.postalCode || null,
        country: data.country,
        isDefault: Boolean(data.isDefault),
      },
    });
    return this.toAddressResponse(address);
  }

  async deleteAddress(addressId: string, userId: string) {
    await this.prisma.address.delete({
      where: { id: addressId, userId },
    });
  }

  async getAddresses(userId: string) {
    const addresses = await this.prisma.address.findMany({ where: { userId } });
    return addresses.map((address) => this.toAddressResponse(address));
  }

  private getAddressFullName(data: any) {
    const fullName = data.fullName || `${data.firstName || ''} ${data.lastName || ''}`;
    if (!fullName.trim()) {
      throw new BadRequestException('Full name is required');
    }
    return fullName.trim();
  }

  private toAddressResponse(address: {
    id: string;
    fullName: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
    isDefault: boolean;
  }) {
    const [firstName, ...lastNameParts] = address.fullName.trim().split(/\s+/);
    return {
      ...address,
      firstName,
      lastName: lastNameParts.join(' '),
      address1: address.line1,
      address2: address.line2 || '',
    };
  }
}
