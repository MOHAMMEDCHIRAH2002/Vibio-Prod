ALTER TABLE "products" ALTER COLUMN "categoryId" DROP NOT NULL;

ALTER TABLE "products" DROP CONSTRAINT "products_categoryId_fkey";

ALTER TABLE "products"
    ADD CONSTRAINT "products_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "categories"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
