# Vibio Demo Deployment Guide

This guide is for deploying the current Vibio codebase as a **free demo environment**:

- **Frontend:** Vercel
- **Backend API:** Render Web Service
- **Database:** Neon Postgres
- **Cache / Redis-compatible store:** Render Key Value

This is the best low-cost path for a client demo. It is **not** the final recommended setup for high-traffic production.

## 1. Demo Architecture

- `web/` = Next.js storefront + admin UI, deployed to **Vercel**
- `api/` = NestJS + Prisma API, deployed to **Render**
- `Neon` = primary PostgreSQL database
- `Render Key Value` = Redis-compatible cache required by the API
- `Cloudinary` = optional, but recommended if the admin needs image upload

## 2. Important Repo-Specific Notes

Before you deploy, there are a few things specific to this repository:

1. The backend requires a `REDIS_URL`.
   The API currently registers a Redis-compatible store at startup. For the free demo, use **Render Key Value**.

2. The backend and frontend both use `NEXT_PUBLIC_*` style URL variables.
   On the backend, `NEXT_PUBLIC_API_URL` is still used internally for Google callback logic. Even though the name looks frontend-only, set it on the API too.

3. There are **no committed Prisma migrations yet** in `api/prisma/migrations`.
   For the free demo, the fastest safe path is to create the schema once with `npm run db:push` from your machine, then seed it with `npm run db:seed`.

4. The backend CORS allowlist is based on one frontend URL.
   Use one stable Vercel production URL or custom domain for the demo, then set that exact URL in the API env as `NEXT_PUBLIC_SITE_URL`.

5. Google sign-in is visible in the current login page.
   If you want Google login in the demo, configure Google OAuth on both frontend and backend. If not, credentials login still works, but you should eventually hide the Google button in code for a cleaner demo.

## 3. Free-Tier Reality Check

This stack is good for demos, testing, and previews. It has real limits:

- **Vercel Hobby** is free, but intended for personal / small-scale use.
- **Render Free Web Service** spins down after **15 minutes of inactivity** and can take about **1 minute** to wake up again.
- **Render Free Key Value** does **not persist data to disk**.
- **Neon Free** is suitable for demo/staging usage and includes a free plan with autoscaling and connection pooling.

For a real production launch, move the API to a paid instance, add proper migration automation, and review auth/payment security.

## 4. Deployment Order

Deploy in this order:

1. Create the Neon database
2. Create the Render Key Value instance
3. Bootstrap the database schema and seed data from your machine
4. Deploy the API on Render
5. Deploy the frontend on Vercel
6. Update OAuth/domain settings if you use Google sign-in

## 5. Accounts You Need

- GitHub
- Vercel
- Render
- Neon
- Google Cloud Console, only if you want Google sign-in
- Cloudinary, only if you want admin image uploads
- Resend / Twilio / Stripe, only if those flows are part of the demo

## 6. Required Environment Variables

### Frontend (`web`)

Set these in the **Vercel project**:

| Variable | Required | Value for demo |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Your Render API base URL, for example `https://vibio-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Your Vercel production URL, for example `https://vibio-demo.vercel.app` |
| `NEXTAUTH_URL` | Yes | Same as `NEXT_PUBLIC_SITE_URL` |
| `NEXTAUTH_SECRET` | Yes | Strong random secret |
| `GOOGLE_CLIENT_ID` | If Google login is enabled | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | If Google login is enabled | Google OAuth client secret |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | If image URLs depend on Cloudinary widgets | Your Cloudinary cloud name |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Only if Stripe is part of the demo | Stripe publishable key |

### Backend (`api`)

Set these in the **Render Web Service**:

| Variable | Required | Value for demo |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Neon Postgres connection string |
| `REDIS_URL` | Yes | Render Key Value internal URL |
| `JWT_SECRET` | Yes | Strong random secret |
| `JWT_REFRESH_SECRET` | Yes | Strong random secret |
| `JWT_EXPIRES_IN` | Recommended | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Recommended | `7d` |
| `NEXT_PUBLIC_API_URL` | Yes | Same public Render API URL, for example `https://vibio-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Same Vercel production URL, for example `https://vibio-demo.vercel.app` |
| `GOOGLE_CLIENT_ID` | If Google login is enabled | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | If Google login is enabled | Google OAuth client secret |
| `CLOUDINARY_CLOUD_NAME` | If admin uploads are used | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | If admin uploads are used | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | If admin uploads are used | Cloudinary API secret |
| `RESEND_API_KEY` | Optional | Only if email sending is needed |
| `EMAIL_FROM` | Optional | Example: `noreply@yourdomain.com` |
| `TWILIO_ACCOUNT_SID` | Optional | Only if WhatsApp is needed |
| `TWILIO_AUTH_TOKEN` | Optional | Only if WhatsApp is needed |
| `TWILIO_WHATSAPP_FROM` | Optional | Twilio WhatsApp sender |
| `STRIPE_SECRET_KEY` | Optional | Only if Stripe is needed |
| `STRIPE_WEBHOOK_SECRET` | Optional | Only if Stripe is needed |

## Secure Secret Generation

Generate secrets locally with one of these:

```bash
openssl rand -base64 32
```

or:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Use different values for:

- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

## 7. Step 1: Create the Neon Database

1. Create a Neon project.
2. Choose a region close to your Render region.
3. Create or keep the default database and role.
4. Copy the **standard Postgres connection string**.

For this repository, the safest first setup is:

- Use the **direct** Neon connection string for `DATABASE_URL`
- Do **not** switch to the pooled Neon URL unless you later add a separate direct migration URL strategy

Example:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.us-east-1.aws.neon.tech/vibio?sslmode=require
```

## 8. Step 2: Create Render Key Value

The API expects Redis-compatible caching. For the free demo:

1. In Render, create **New > Key Value**
2. Choose the **same region** as your backend API
3. Select the **Free** instance type
4. Copy the **internal URL**

Example:

```env
REDIS_URL=redis://red-xxxxxxxxxxxxxxxx:6379
```

Use the internal URL if the Key Value instance and API are in the same Render region.

## 9. Step 3: Bootstrap the Database From Your Machine

Because this repo currently has **no committed Prisma migrations**, and because free Render web services do not offer the paid pre-deploy command flow, the simplest approach is:

1. Point `DATABASE_URL` locally to your Neon database
2. Push the schema once
3. Seed demo data once

From the repo root:

```bash
cd api
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

This will:

- create the tables in Neon
- seed products, categories, banners, blog posts, and demo users

### Demo Admin Credentials

The current seed file creates:

- `admin@vibio.com` / `Admin123!`

Additional seeded users:

- `sarah@example.com` / `Test123!`
- `ahmed@example.com` / `Test123!`

## 10. Recommended Upgrade: Commit Prisma Migrations

For a more production-like workflow, do this before long-term deployment:

```bash
cd api
npx prisma migrate dev --name init
```

Then commit the generated `api/prisma/migrations` folder.

Once migrations exist, your preferred production deployment flow becomes:

```bash
npm run db:migrate:deploy
```

For the current free demo, `db:push` is acceptable and faster.

## 11. Step 4: Deploy the Backend on Render

Create a **Web Service** on Render with these settings:

| Setting | Value |
| --- | --- |
| Service Type | Web Service |
| Root Directory | `api` |
| Runtime | Node |
| Branch | Your production branch, usually `main` |
| Build Command | `npm install && npm run db:generate && npm run build` |
| Start Command | `npm run start:prod` |
| Instance Type | Free |

### Important

The API now supports `PORT`, which is required for Render-style deployment.

### Backend Environment Variables

Add at least:

```env
DATABASE_URL=your-neon-url
REDIS_URL=your-render-key-value-internal-url
JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
```

Optional:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
EMAIL_FROM=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_FROM=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

### Backend Smoke Test

After deploy, confirm:

- `https://your-api.onrender.com/api/docs` loads
- `https://your-api.onrender.com/api/products` returns JSON

## 12. Step 5: Deploy the Frontend on Vercel

Create a Vercel project from the same GitHub repo with:

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root Directory | `web` |
| Build Command | `next build` or leave default |
| Output | default |

### Frontend Environment Variables

Set:

```env
NEXT_PUBLIC_API_URL=https://your-api.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-frontend.vercel.app
NEXTAUTH_URL=https://your-frontend.vercel.app
NEXTAUTH_SECRET=replace-me
```

If Google login stays enabled:

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Optional:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

### Frontend Smoke Test

After deploy, confirm:

- home page loads
- shop page loads
- login page loads
- credentials login works
- admin dashboard opens after admin login

## 13. Google OAuth Setup

Only do this if you want Google login in the demo.

Create OAuth credentials in Google Cloud and add these authorized URLs:

### Authorized JavaScript origins

- `https://your-frontend.vercel.app`
- `https://your-api.onrender.com` only if you plan to use backend-driven Google auth routes

### Authorized redirect URIs

- `https://your-frontend.vercel.app/api/auth/callback/google`
- `https://your-api.onrender.com/api/auth/google/callback` only if you plan to keep the backend Google strategy flow active

For the current UI, the main Google login entry point is the **frontend NextAuth flow**, so the Vercel callback URL is the most important one.

## 14. Cloudinary Setup for Admin Uploads

If the client needs image upload from admin:

1. Create a free Cloudinary account
2. Copy:
   - cloud name
   - API key
   - API secret
3. Set backend vars:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Set frontend var if needed:
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`

If Cloudinary is not configured, upload-related admin features may fail.

## 15. Suggested Demo Configuration

For the cleanest free client demo, enable only what you need:

- Enable:
  - storefront
  - admin dashboard
  - credentials login
  - Neon database
  - Render Key Value
  - Cloudinary, if admin uploads matter

- Disable or postpone:
  - Stripe payments
  - Resend email flows
  - Twilio WhatsApp
  - Google sign-in, unless the client explicitly wants it

This keeps the free demo easier to deploy and easier to support.

## 16. Final Demo Checklist

Before sending the demo to the client, verify:

1. Storefront loads from Vercel
2. API responds from Render
3. Neon contains seeded data
4. Admin login works with `admin@vibio.com`
5. `/admin` loads correctly
6. Product images load
7. If uploads are enabled, upload one image from admin
8. If Google login is enabled, test it end-to-end
9. If payments are enabled, test checkout in sandbox only

## 17. What To Improve Before Real Production

Before moving from free demo to real production, do these:

1. Commit Prisma migrations and stop relying on `db:push`
2. Move the backend from Render Free to a paid instance to remove cold starts
3. Keep Redis on a persistent plan
4. Put frontend and backend on custom domains
5. Review the Google auth flow and remove any legacy paths you do not use
6. Harden payment, email, and webhook configuration
7. Add monitoring, alerts, backups, and error tracking

## 18. Official References

- Vercel Next.js deployment docs: https://vercel.com/docs/frameworks/nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel Hobby plan: https://vercel.com/docs/plans/hobby
- Render web services: https://render.com/docs/web-services
- Render deploy pipeline: https://render.com/docs/deploys
- Render free instances: https://render.com/docs/free
- Render Key Value: https://render.com/redis
- Neon connection basics: https://neon.com/docs/get-started-with-neon/connect-neon
- Neon pricing: https://neon.com/pricing
- Prisma production migrations: https://www.prisma.io/docs/cli/migrate/deploy
