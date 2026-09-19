#!/bin/sh
set -e

echo "→ Syncing database schema (prisma db push)..."
# prisma CLI + engines are present in node_modules (copied from the builder stage).
# db push applies the schema. This project uses db push (no migrations), so the
# schema file is the source of truth; --accept-data-loss lets destructive changes
# (e.g. a dropped/renamed column) apply on deploy instead of crash-looping here.
npx prisma db push --skip-generate --accept-data-loss

# Seed the database the first time only (when it has no products yet).
# The seed uses create/createMany for orders/banners/blog, so re-running it on
# every start would duplicate rows — hence the emptiness guard.
echo "→ Checking whether the database needs seeding..."
COUNT=$(node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.product.count().then(n=>{console.log(n);return p.\$disconnect();}).catch(()=>{console.log(0);});" 2>/dev/null || echo 0)

if [ "$COUNT" = "0" ]; then
  echo "→ Empty database — running seed..."
  # Use the COMPILED seed (nest build emits dist/prisma/seed.js) so we don't
  # depend on ts-node, which errors on ".ts" under Node 20's ESM loader.
  node dist/prisma/seed.js
else
  echo "→ Database already has $COUNT products — skipping seed."
fi

echo "→ Starting Vibio API..."
# nest build emits the entry at dist/src/main.js (there is no nest-cli.json and
# .ts files exist outside src/, so tsc preserves the folder structure).
exec node dist/src/main
