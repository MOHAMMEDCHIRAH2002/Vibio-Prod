CREATE TABLE "category_slug_aliases" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_slug_aliases_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "category_slug_aliases_slug_key"
    ON "category_slug_aliases"("slug");

CREATE INDEX "category_slug_aliases_categoryId_idx"
    ON "category_slug_aliases"("categoryId");

ALTER TABLE "category_slug_aliases"
    ADD CONSTRAINT "category_slug_aliases_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
