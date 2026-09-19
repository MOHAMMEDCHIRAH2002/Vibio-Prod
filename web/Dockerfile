FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Next.js inlines NEXT_PUBLIC_* into the client bundle at BUILD time, so these
# must be present before `npm run build` — values injected at runtime (Render's
# env vars, compose `environment:`) arrive too late and leave the browser with
# `undefined`. That failure is silent: the build succeeds and the storefront
# then calls the wrong origin, so no products, cart, or login work.
# Pass these as Docker build arguments (Render: Settings → Docker Build Arguments).
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STORE_PHONE_NUMBER
ARG NEXT_PUBLIC_STORE_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STORE_PHONE_NUMBER=$NEXT_PUBLIC_STORE_PHONE_NUMBER \
    NEXT_PUBLIC_STORE_WHATSAPP_NUMBER=$NEXT_PUBLIC_STORE_WHATSAPP_NUMBER

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
