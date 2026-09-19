import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { Role, User } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { NotificationsService } from '../notifications/notifications.service';

function toSafeUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    image: user.image,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private notifications: NotificationsService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    await this.notifications.sendWelcome(user.email, user.name || 'Friend');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user, ...tokens };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: toSafeUser(user), ...tokens };
  }

  async refresh(userId: string, email: string, role: Role) {
    return this.generateTokens(userId, email, role);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Always return the same message to avoid email enumeration
    if (!user || !user.passwordHash) return { message: 'If that email exists, a reset link has been sent.' };

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpires: expires } as any,
    });

    const siteUrl = this.config.get('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    // Always log the reset URL so you can test locally even without a mail provider configured
    console.log(`\n🔑 Password reset link for ${user.email}:\n   ${resetUrl}\n`);

    await this.notifications.sendPasswordReset(user.email, user.name || 'Friend', resetUrl);

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      } as any,
    });

    if (!user) throw new BadRequestException('Reset link is invalid or has expired.');

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpires: null } as any,
    });

    return { message: 'Password updated successfully.' };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async googleLogin(googleUser: {
    email: string;
    name: string;
    image?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          image: googleUser.image,
          emailVerified: new Date(),
        },
      });
      await this.notifications.sendWelcome(user.email, user.name || 'Friend');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    return { user: toSafeUser(user), ...tokens };
  }

  private async generateTokens(userId: string, email: string, role: Role) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN') || '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }
}
