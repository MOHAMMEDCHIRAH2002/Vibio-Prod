import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import axios from 'axios';
import { SERVER_API_URL } from '@/lib/serverApiUrl';

// NextAuth runs server-side (inside the web container in Docker), so it must
// use the internal API URL, not the browser-facing one.
const API_URL = SERVER_API_URL;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 1000;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function decodeJwtPayload(token: string) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { exp?: number };
  } catch {
    return null;
  }
}

function getAccessTokenExpires(accessToken: string) {
  const payload = decodeJwtPayload(accessToken);
  if (payload?.exp) return payload.exp * 1000;

  // Fallback when the token payload cannot be decoded.
  return Date.now() + 14 * 60 * 1000;
}

async function refreshAccessToken(token: JWT) {
  try {
    if (!token.refreshToken) {
      return { ...token, error: 'RefreshAccessTokenError' as const };
    }

    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken: token.refreshToken,
    });

    const nextAccessToken = response.data.accessToken as string;
    const nextRefreshToken = (response.data.refreshToken as string | undefined) || token.refreshToken;

    return {
      ...token,
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
      accessTokenExpires: getAccessTokenExpires(nextAccessToken),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      error: 'RefreshAccessTokenError' as const,
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/login`, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const { user, accessToken, refreshToken } = res.data;

          if (user && accessToken) {
            return {
              ...user,
              accessToken,
              refreshToken,
            };
          }

          return null;
        } catch {
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === 'google' && profile?.email) {
        try {
          const res = await axios.post(`${API_URL}/api/auth/google/exchange`, {
            email: profile.email,
            name: (profile as any).name,
            image: (profile as any).picture,
          });
          const { user: exchangedUser, accessToken, refreshToken } = res.data;
          token.id = exchangedUser.id;
          token.role = exchangedUser.role;
          token.accessToken = accessToken;
          token.refreshToken = refreshToken;
          token.accessTokenExpires = getAccessTokenExpires(accessToken);
          token.error = undefined;
          return token;
        } catch {
          return { ...token, error: 'RefreshAccessTokenError' as const };
        }
      }

      if (user) {
        const nextAccessToken = (user as any).accessToken as string | undefined;

        token.id = user.id as string;
        token.role = (user as any).role;
        token.accessToken = nextAccessToken;
        token.refreshToken = (user as any).refreshToken;
        token.accessTokenExpires = nextAccessToken
          ? getAccessTokenExpires(nextAccessToken)
          : undefined;
        token.error = undefined;
      }

      if (token.accessToken && !token.accessTokenExpires) {
        token.accessTokenExpires = getAccessTokenExpires(token.accessToken);
      }

      if (
        token.accessToken &&
        token.accessTokenExpires &&
        Date.now() >= token.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
      ) {
        token = await refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      } else {
        session.accessToken = undefined as unknown as string;
        token.error = token.error ?? 'NoAccessToken';
      }
      session.accessTokenExpires = token.accessTokenExpires;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  },
  jwt: {
    maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: 'RefreshAccessTokenError' | 'NoAccessToken';
  }
}
