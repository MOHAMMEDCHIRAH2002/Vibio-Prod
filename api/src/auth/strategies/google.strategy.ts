import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get('GOOGLE_CLIENT_ID') || 'disabled';
    const clientSecret = config.get('GOOGLE_CLIENT_SECRET') || 'disabled';
    super({
      clientID,
      clientSecret,
      callbackURL: `${config.get('NEXT_PUBLIC_API_URL', 'http://localhost:3001')}/api/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      name: `${name.givenName} ${name.familyName}`,
      image: photos[0]?.value,
      googleId: profile.id,
    };
    done(null, user);
  }
}
