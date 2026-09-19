# Google OAuth Setup

Follow these steps to enable Google sign-in for your Vibio store.

## 1. Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click **Select a project → New Project**
3. Name it `vibio-ecommerce` and click **Create**

## 2. Enable the Google+ API

1. In the left sidebar go to **APIs & Services → Library**
2. Search for **Google+ API** and click **Enable**
   (Alternatively enable **Google Identity** if that's what appears)

## 3. Configure the OAuth consent screen

1. Go to **APIs & Services → OAuth consent screen**
2. Choose **External** and click **Create**
3. Fill in:
   - **App name**: Vibio
   - **User support email**: mohammed.chirah@gmail.com
   - **Developer contact email**: mohammed.chirah@gmail.com
4. Click **Save and Continue** through the remaining steps
5. On the **Test users** step, add `mohammed.chirah@gmail.com` so you can test before publishing

## 4. Create OAuth credentials

1. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: `Vibio Web`
4. Add **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
5. Add **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://yourdomain.com/api/auth/callback/google
   ```
6. Click **Create** and copy the **Client ID** and **Client Secret**

## 5. Add credentials to environment files

In `web/.env.local`:
```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
NEXTAUTH_SECRET=any-long-random-string-32-chars-min
NEXTAUTH_URL=http://localhost:3000
```

## 6. How it works in this project

When a user signs in with Google, NextAuth calls the `/api/auth/google/exchange` endpoint on the NestJS API with the user's email, name, and picture. The API finds or creates the user in the database and returns JWT tokens — the same flow as email/password login.

The relevant code is in [web/lib/auth.ts](../web/lib/auth.ts) under the `account?.provider === 'google'` branch.
