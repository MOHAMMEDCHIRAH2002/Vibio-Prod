# ---- Builder ----
FROM node:20-alpine AS builder

# Prisma needs OpenSSL present to build/select the correct query engine.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ---- Runner ----
FROM node:20-alpine AS runner

# OpenSSL is required at runtime by the Prisma query/schema engines.
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

# Copy the full node_modules from the builder. This guarantees the Prisma CLI,
# its Alpine (musl) query-engine binaries, and the generated client are all
# present and mutually compatible at runtime (needed by the entrypoint's
# `prisma db push`). It also keeps ts-node available for `npm run db:seed`.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

COPY docker-entrypoint.sh ./docker-entrypoint.sh
# Normalize potential CRLF line endings (Windows) so /bin/sh can run the script.
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh

EXPOSE 3001

CMD ["./docker-entrypoint.sh"]
