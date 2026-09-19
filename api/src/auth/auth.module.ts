import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { NotificationsModule } from '../notifications/notifications.module';

const googleStrategyProvider = {
  provide: GoogleStrategy,
  useFactory: (config: ConfigService) => {
    if (!config.get('GOOGLE_CLIENT_ID')) return null;
    return new GoogleStrategy(config);
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    ConfigModule,
    NotificationsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy, googleStrategyProvider],
  exports: [AuthService],
})
export class AuthModule {}
