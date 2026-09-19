import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ConfigService } from '@nestjs/config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private config: ConfigService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('jwt-refresh'))
  refresh(@CurrentUser() user: any) {
    return this.auth.refresh(user.id, user.email, user.role);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  logout(@CurrentUser('id') userId: string) {
    return this.auth.logout(userId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  me(@CurrentUser() user: any) {
    return user;
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() body: { email: string }) {
    return this.auth.forgotPassword(body.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() body: { token: string; password: string }) {
    return this.auth.resetPassword(body.token, body.password);
  }

  @Post('google/exchange')
  @HttpCode(HttpStatus.OK)
  googleExchange(
    @Body() body: { email: string; name?: string; image?: string },
  ) {
    return this.auth.googleLogin({
      email: body.email,
      name: body.name || body.email,
      image: body.image,
    });
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.auth.googleLogin(req.user);
    const siteUrl = this.config.get('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000';
    res.redirect(
      `${siteUrl}/auth/callback?token=${result.accessToken}&refresh=${result.refreshToken}`,
    );
  }
}
