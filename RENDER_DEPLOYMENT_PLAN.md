# Vibio — Free Demo Deployment Plan (Render + Neon + Upstash)

> Target: a free, shareable client demo.
> Stack: **Render** (web + API, Docker) · **Neon** (Postgres) · **Upstash** (Redis) · **Heberjahiz SMTP** (email, unchanged).
> Status: **plan only — no code changed.** Section 3 lists the changes required before the first deploy can succeed.

Supersedes [DEPLOYMENT_DEMO.md](DEPLOYMENT_DEMO.md), which targeted Vercel + Render Key Value.

---

## 1. Architecture

```
  Browser
     │
     ├──────────────► Render Web Service "vibio-web"   (Next.js, Docker, port 3000)
     │                        │
     │                        │ server-side fetch (INTERNAL_API_URL)
     │                        ▼
     └──────────────► Render Web Service "vibio-api"   (NestJS, Docker, port 3001)
                              │
                ┌─────────────┼──────────────┬────────────────────┐
                ▼             ▼              ▼                    ▼
          Neon Postgres   Upstash Redis   mail.vibio.ma:465   api.twilio.com
          (DATABASE_URL)  (REDIS_URL)     (SMTP, email)       (WhatsApp)
```

Two Render services, both free. The browser talks to the API directly (CORS), so the API must be a **public** service, not private.

---

## 2. Can the existing Dockerfiles be used?

### `api/Dockerfile` — ✅ **Yes, as-is. No changes needed.**

It is already correct for Render:

| Requirement | Status |
|---|---|
| Binds `0.0.0.0` | ✅ `main.ts` hardcodes host `0.0.0.0` |
| Honours injected `PORT` | ✅ `Number(process.env.PORT \|\| 3001)` — Render's `PORT` wins |
| Prisma engine matches base image | ✅ `binaryTargets` includes `linux-musl-openssl-3.0.x` for `node:20-alpine` |
| OpenSSL present at runtime | ✅ `apk add openssl` in the runner stage |
| Schema applied on boot | ✅ entrypoint runs `prisma db push` — works around the empty `prisma/migrations/` |
| Seeds only once | ✅ entrypoint guards on `product.count() == 0` |

`EXPOSE 3001` is cosmetic; Render routes to whatever `PORT` the process binds.

⚠️ Two behaviours to be aware of, not bugs:
- The entrypoint runs `prisma db push --accept-data-loss` on **every** boot. On Render free the service restarts after each spin-down, so this runs on every cold start — it adds a few seconds and, on a schema change, will drop columns without warning. Fine for a demo; replace with real migrations before production.
- The seed runs only when the product table is empty, so a cold start won't duplicate data.

### `web/Dockerfile` — ❌ **No. It will build, but the demo will be broken.**

This is the **one hard blocker.** `NEXT_PUBLIC_*` variables are inlined into the client bundle **at build time**. The Dockerfile declares no `ARG`, so environment variables you set in the Render dashboard arrive at *runtime* — too late. They will be `undefined` in the browser bundle.

Consequences on a live demo:
- `NEXT_PUBLIC_API_URL` is `undefined` → **every browser API call goes to the wrong origin. The storefront does not work at all** — no products, no cart, no login.
- `NEXT_PUBLIC_STORE_PHONE_NUMBER` / `..._WHATSAPP_NUMBER` are empty → `PhoneOrder.tsx` hits its `if (!STORE_PHONE && !STORE_WHATSAPP) return null` guard and the whole "Order by phone / WhatsApp" block silently disappears.

This is the same defect recorded as **B2** in [EMAIL_WHATSAPP_TODO.md](EMAIL_WHATSAPP_TODO.md); it was never fixed because Docker Compose masked it locally.

**Required change (section 3.1).** Everything else in `web/Dockerfile` — standalone output, `PORT`/`HOSTNAME` env — is already correct for Render.

---

## 3. Changes required before the first deploy

Listed, not applied. **3.1 is mandatory; 3.2–3.4 are recommended.**

### 3.1 — `web/Dockerfile`: accept build args ⛔ MANDATORY

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Values must exist BEFORE `npm run build` — Next inlines them into the bundle.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STORE_PHONE_NUMBER
ARG NEXT_PUBLIC_STORE_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STORE_PHONE_NUMBER=$NEXT_PUBLIC_STORE_PHONE_NUMBER \
    NEXT_PUBLIC_STORE_WHATSAPP_NUMBER=$NEXT_PUBLIC_STORE_WHATSAPP_NUMBER

RUN npm run build
```

Then in Render → `vibio-web` → **Settings → Docker Build Arguments**, add the same four keys with the same values as the runtime env vars.

> Verify in the Render dashboard that build args are being passed — if a `NEXT_PUBLIC_*` value is missing at build time, the failure is silent (empty string), not a build error.

### 3.2 — `NEXT_PUBLIC_STORE_*` beyond phone/WhatsApp will not work

[web/lib/storeConfig.ts](web/lib/storeConfig.ts) reads env through a helper:

```ts
const env = (key: string, fallback = '') => process.env[key] ?? fallback;
```

Next.js only substitutes **literal** `process.env.NEXT_PUBLIC_FOO`. Dynamic `process.env[key]` is never replaced, so in the browser every value is `undefined`. All three consumers (`StoreLocator`, `VisitStoreSection`, `VisitStoreCTA`) are `'use client'`.

**Effect:** setting `NEXT_PUBLIC_STORE_NAME`, `_ADDRESS`, `_CITY`, `_COUNTRY`, `_EMAIL`, `_PHOTOS`, `_MAP_EMBED_URL`, `_MAP_LINK` in Render changes nothing — the store page keeps the hardcoded Casablanca placeholders. Either fix `storeConfig.ts` to use literal accesses, or accept the defaults for the demo. (`PhoneOrder.tsx` uses literal access, so its two variables *do* work once 3.1 is done.)

### 3.3 — Contact page shows hardcoded placeholders

[contact/page.tsx](web/app/(storefront)/contact/page.tsx) hardcodes `hello@vibio.com`, `+212 6 00 00 00 00`, `Casablanca, Morocco`. A client demo will see fake contact details. Defect **B4** in the todo doc.

### 3.4 — Optional: add a health endpoint

The API has no `/health`. Render's health checks and any uptime pinger (§7) will have to hit something like `/api/categories`, which wakes the DB on every ping. A trivial `@Get('health')` returning `{ok:true}` avoids that.

---

## 4. Environment variables

### 4.1 — Render service `vibio-api`

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://…@ep-xxx-pooler.<region>.aws.neon.tech/vibio?sslmode=require` | **Use the POOLED string** (`-pooler` in host). `sslmode=require` is mandatory. |
| `REDIS_URL` | `rediss://default:<token>@<host>.upstash.io:6379` | **`rediss://`** (two s) for TLS. |
| `NODE_ENV` | `production` | |
| `PORT` | *(leave unset)* | Render injects it. |
| `JWT_SECRET` | 32+ random chars | `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | 32+ random chars, different | |
| `JWT_EXPIRES_IN` | `15m` | |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | |
| `NEXT_PUBLIC_SITE_URL` | `https://vibio-web.onrender.com` | **Drives the CORS allowlist.** Exact, no trailing slash. |
| `NEXT_PUBLIC_API_URL` | `https://vibio-api.onrender.com` | Used by Google callback logic. |
| `ADMIN_SITE_URL` | `https://vibio-web.onrender.com` | "Open in admin" links in notifications. |
| `EMAIL_PROVIDER` | `smtp` | |
| `EMAIL_FROM` | `Vibio <contact@vibio.ma>` | |
| `SMTP_HOST` | `mail.vibio.ma` | |
| `SMTP_PORT` | `465` | |
| `SMTP_SECURE` | `true` | |
| `SMTP_USER` | `contact@vibio.ma` | |
| `SMTP_PASS` | *(mailbox password)* | Mark as secret. **Rotate first** — see §8. |
| `STORE_NOTIFICATION_EMAIL` | `contact@vibio.ma` | |
| `STORE_NOTIFICATION_PHONE` | `+212603359272` | |
| `STORE_WHATSAPP_NUMBER` | `+212603359272` | |
| `ADMIN_ORDER_NOTIFY_ON` | `created` | |
| `WHATSAPP_PROVIDER` | `twilio` | Or leave blank to disable WhatsApp in the demo. |
| `TWILIO_ACCOUNT_SID` | `AC…` | Sandbox only reaches numbers that sent the join code. |
| `TWILIO_AUTH_TOKEN` | *(token)* | Mark as secret. |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | |
| `GOOGLE_CLIENT_ID` | *(from Google Cloud)* | Only if Google sign-in is in the demo. |
| `GOOGLE_CLIENT_SECRET` | *(from Google Cloud)* | Mark as secret. |
| `RESEND_API_KEY` | *(optional)* | Only as an `EMAIL_PROVIDER=resend` fallback. |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | *(optional)* | Needed only for admin image upload. |

### 4.2 — Render service `vibio-web`

Set these **both** as runtime env vars **and** as Docker Build Arguments (the `NEXT_PUBLIC_*` four):

| Variable | Value | Build arg? |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://vibio-api.onrender.com` | ✅ **required** |
| `NEXT_PUBLIC_SITE_URL` | `https://vibio-web.onrender.com` | ✅ **required** |
| `NEXT_PUBLIC_STORE_PHONE_NUMBER` | `+212603359272` | ✅ **required** |
| `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER` | `212603359272` | ✅ **required** (digits only, no `+`) |
| `INTERNAL_API_URL` | `https://vibio-api.onrender.com` | runtime only |
| `NEXTAUTH_URL` | `https://vibio-web.onrender.com` | runtime only |
| `NEXTAUTH_SECRET` | 32+ random chars | runtime only, secret |
| `GOOGLE_CLIENT_ID` | *(same as API)* | runtime only |
| `GOOGLE_CLIENT_SECRET` | *(same as API)* | runtime only, secret |
| `NODE_ENV` | `production` | |

`INTERNAL_API_URL` can use Render's private address if both services share a region; the public HTTPS URL is simpler and works either way.

### 4.3 — Google OAuth (only if Google sign-in is demoed)

In Google Cloud Console → Credentials → your OAuth client, add:

- Authorized JavaScript origin: `https://vibio-web.onrender.com`
- Authorized redirect URI: `https://vibio-web.onrender.com/api/auth/callback/google`

Omitting this produces `redirect_uri_mismatch`. (The earlier `invalid_client` you hit was a different cause — a placeholder client ID.)

---

## 5. Deployment order

1. **Neon** — create project + database `vibio`. Copy the **pooled** connection string; append `?sslmode=require`.
2. **Upstash** — create a Redis database in the region closest to Render. Copy the `rediss://` URL.
3. **Apply 3.1** to `web/Dockerfile`, commit, push.
4. **Render → New Web Service → `vibio-api`**
   - Runtime **Docker**, Root Directory `api`, Dockerfile `api/Dockerfile`, plan **Free**.
   - Add all §4.1 variables. Deploy.
   - Watch logs for: `Email provider: smtp`, `WhatsApp provider: twilio`, `API running on: http://0.0.0.0:10000`, and the entrypoint's `db push` + seed.
5. **Render → New Web Service → `vibio-web`**
   - Runtime **Docker**, Root Directory `web`, Dockerfile `web/Dockerfile`, plan **Free**.
   - Add §4.2 runtime vars **and** the four build arguments. Deploy.
6. **Back-fill URLs** — once Render assigns the real hostnames, update `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_API_URL` / `ADMIN_SITE_URL` on both services and **redeploy the web service** (build args changed → the bundle must be rebuilt).
7. **Google OAuth** — add the redirect URIs from §4.3.
8. **Verify** — §7.

The database schema and seed data are created automatically by the API's entrypoint on its first boot. No manual `db push` needed, unlike the old Vercel plan.

---

## 6. Free-tier reality check

| Limit | Impact |
|---|---|
| **Render free spins down after ~15 min idle** | First visit after idle takes **~50s** on *each* service. A client clicking a cold link may think it's broken. Mitigation in §7. |
| **Render free: 512 MB RAM / 0.1 CPU** | Next.js + NestJS both fit, but builds are slow (5–15 min). |
| **Neon free autosuspends after ~5 min idle** | Adds a cold-start delay on the first query, stacking with Render's. |
| **Neon free: 0.5 GB storage** | Far more than a demo needs. |
| **Upstash free: 256 MB, ~500K commands/month** | Fine for a demo. **But carts live only in Redis** (`cart:*` keys via ioredis) — eviction or a wiped instance loses every active cart. Orders are safe; they're in Postgres. |
| **Heberjahiz `MAILMAX=1000`** | Server-side outbound cap. Ample for demo notifications. |
| **Twilio WhatsApp sandbox** | Only delivers to numbers that sent the join code, and the session expires. Customer WhatsApp will fail for demo shoppers — expected. |

**Two cold starts stack.** Worst case ≈ 50s (Render web) + 50s (Render API) + Neon resume. Warm the demo before a client call.

---

## 7. Post-deploy verification

```bash
API=https://vibio-api.onrender.com
WEB=https://vibio-web.onrender.com

curl -s -o /dev/null -w "%{http_code}\n" $API/api/categories     # 200 + JSON
curl -s -o /dev/null -w "%{http_code}\n" $WEB/                    # 200
curl -s -H "Origin: $WEB" -I $API/api/categories | grep -i access-control  # CORS header present
```

Then in a browser:

1. Homepage lists products and **5 categories** → proves `NEXT_PUBLIC_API_URL` was baked correctly.
2. Product page shows the **"Order by phone / WhatsApp"** block → proves the build args worked. If missing, §3.1 was not applied.
3. Register an account → welcome email arrives at that address.
4. Submit the contact form → email lands in `contact@vibio.ma`; API log shows `Email sent via smtp`.
5. Add to cart → proves Upstash connectivity (cart is Redis-only).
6. Place a COD order → order confirmation to the customer + admin alert to `contact@vibio.ma`.
7. Log in as `admin@vibio.com` / `Admin123!` (seeded) → `/admin` loads. **Change this password before sharing the demo.**

**Keeping it warm:** a free uptime pinger (UptimeRobot, cron-job.org) hitting both services every 10 minutes prevents spin-down. Ping a cheap endpoint — another reason for the health endpoint in §3.4, since pinging `/api/categories` wakes Neon each time and burns Upstash commands.

---

## 8. Security before sharing the link

- **Rotate `SMTP_PASS`, `TWILIO_AUTH_TOKEN`, and `RESEND_API_KEY`** — all three were pasted into a chat transcript during development.
- **Change the seeded `admin@vibio.com` / `Admin123!` password** — it is public in `api/prisma/seed.ts`.
- Generate **fresh** `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXTAUTH_SECRET` for Render; do not reuse the dev values.
- Mark every credential as **secret** in the Render dashboard so it isn't echoed in build logs.
- `.env` is gitignored — confirm no secret was ever committed before making the repo accessible to Render.

---

## 9. Summary answers

**Can the existing Dockerfiles be used?**
`api/Dockerfile` — yes, unchanged. `web/Dockerfile` — no; it needs four `ARG` lines (§3.1) or the storefront ships with an undefined API URL and cannot load data.

**Which env vars?**
33 on the API (§4.1), 10 on the web service (§4.2) — of which four must *also* be Docker build arguments.

**Biggest risks:** the web build-arg blocker (§3.1), stacked cold starts on free tiers (§6), and Redis-only cart storage (§6).
