# CONTEXT.md — Luxury E-commerce Platform

## Brand Identity
- **Brand name**: [YOUR_BRAND_NAME]
- **Tagline**: "Nature's Finest, Crafted for You"
- **Category**: Premium natural products (dates, chocolates, coffee, tea, cosmetics)
- **Target audience**: Urban women 25–45, gifting buyers, wellness enthusiasts
- **Aesthetic**: Luxury boutique — warm ivory, champagne gold, clean white space

---

## Design Tokens

```
Colors:
  primary-bg:    #FAF7F2   (ivory cream)
  accent-gold:   #C9A96E   (champagne gold)
  text-dark:     #1C1C1C   (charcoal)
  text-muted:    #6B6560   (warm gray)
  surface:       #FFFFFF
  blush:         #F5EDE6   (soft pink beige)
  success:       #4A7C59
  error:         #C0392B

Fonts:
  heading:  "Playfair Display", serif
  body:     "Inter", sans-serif

Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96px
Border radius: sm=4px, md=8px, lg=16px, xl=24px, full=9999px

Shadows:
  card:    0 2px 16px rgba(0,0,0,0.06)
  hover:   0 8px 32px rgba(0,0,0,0.12)
  gold:    0 4px 24px rgba(201,169,110,0.25)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Shadcn UI (customized) |
| Animations | Framer Motion |
| Backend | NestJS + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 16 |
| Cache / Sessions | Redis 7 |
| Auth | NextAuth.js (credentials + Google OAuth) |
| File uploads | Cloudinary |
| Email | Resend (HTML templates) |
| WhatsApp | Twilio WhatsApp Business API |
| Infrastructure | Docker + Docker Compose |
| Data fetching | TanStack Query (React Query v5) |
| Forms | React Hook Form + Zod |
| Charts (admin) | Recharts |

---

## Database Models (Prisma Schema)

### User & Auth
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?
  passwordHash  String?
  role          Role      @default(CUSTOMER)
  emailVerified DateTime?
  image         String?
  addresses     Address[]
  orders        Order[]
  wishlist      Wishlist[]
  reviews       Review[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role { CUSTOMER ADMIN }

model Address {
  id         String  @id @default(cuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id])
  label      String?
  fullName   String
  phone      String
  line1      String
  line2      String?
  city       String
  state      String?
  postalCode String?
  country    String
  isDefault  Boolean @default(false)
}
```

### Catalog
```prisma
model Category {
  id          String     @id @default(cuid())
  slug        String     @unique
  name        String
  description String?
  image       String?
  parentId    String?
  parent      Category?  @relation("SubCategories", fields: [parentId], references: [id])
  children    Category[] @relation("SubCategories")
  products    Product[]
  sortOrder   Int        @default(0)
}

model Product {
  id           String      @id @default(cuid())
  slug         String      @unique
  name         String
  description  String      @db.Text
  shortDesc    String?
  images       String[]
  categoryId   String
  category     Category    @relation(fields: [categoryId], references: [id])
  tags         Tag[]
  variants     Variant[]
  basePrice    Decimal     @db.Decimal(10,2)
  comparePrice Decimal?    @db.Decimal(10,2)
  isFeatured   Boolean     @default(false)
  isActive     Boolean     @default(true)
  metaTitle    String?
  metaDesc     String?
  weight       Float?
  reviews      Review[]
  orderItems   OrderItem[]
  wishlist     Wishlist[]
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}

model Variant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  name      String
  value     String
  price     Decimal  @db.Decimal(10,2)
  stock     Int      @default(0)
  sku       String?  @unique
}

model Tag {
  id       String     @id @default(cuid())
  name     String     @unique
  slug     String     @unique
  products Product[]
  posts    BlogPost[]
}
```

### Orders
```prisma
model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  items           OrderItem[]
  status          OrderStatus   @default(PENDING)
  paymentStatus   PaymentStatus @default(PENDING)
  paymentMethod   String?
  shippingAddress Json
  subtotal        Decimal       @db.Decimal(10,2)
  shippingCost    Decimal       @db.Decimal(10,2)
  discount        Decimal       @default(0) @db.Decimal(10,2)
  total           Decimal       @db.Decimal(10,2)
  promoCodeId     String?
  promoCode       PromoCode?    @relation(fields: [promoCodeId], references: [id])
  notes           String?
  trackingNumber  String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  variantId String?
  name      String
  variant   String?
  price     Decimal @db.Decimal(10,2)
  quantity  Int
  image     String?
}

enum OrderStatus   { PENDING CONFIRMED PROCESSING SHIPPED DELIVERED CANCELLED REFUNDED }
enum PaymentStatus { PENDING PAID FAILED REFUNDED }
```

### Promotions & Content
```prisma
model PromoCode {
  id        String    @id @default(cuid())
  code      String    @unique
  type      PromoType
  value     Decimal   @db.Decimal(10,2)
  minOrder  Decimal?  @db.Decimal(10,2)
  maxUses   Int?
  usedCount Int       @default(0)
  expiresAt DateTime?
  isActive  Boolean   @default(true)
  orders    Order[]
}
enum PromoType { PERCENTAGE FIXED FREE_SHIPPING }

model Review {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  rating     Int
  title      String?
  body       String?  @db.Text
  isApproved Boolean  @default(false)
  createdAt  DateTime @default(now())
}

model Banner {
  id           String    @id @default(cuid())
  title        String
  subtitle     String?
  imageDesktop String
  imageMobile  String?
  ctaText      String?
  ctaLink      String?
  sortOrder    Int       @default(0)
  isActive     Boolean   @default(true)
  startsAt     DateTime?
  endsAt       DateTime?
}

model BlogPost {
  id          String    @id @default(cuid())
  slug        String    @unique
  title       String
  excerpt     String?
  content     String    @db.Text
  coverImage  String?
  authorId    String
  isPublished Boolean   @default(false)
  metaTitle   String?
  metaDesc    String?
  tags        Tag[]
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
}

model Wishlist {
  id        String  @id @default(cuid())
  userId    String
  user      User    @relation(fields: [userId], references: [id])
  productId String
  product   Product @relation(fields: [productId], references: [id])
  @@unique([userId, productId])
}
```

---

## API Endpoints (NestJS REST)

### Auth — `/auth`
| Method | Path | Guard | Description |
|---|---|---|---|
| POST | /auth/register | public | Register new customer |
| POST | /auth/login | public | Login, returns access + refresh tokens |
| POST | /auth/refresh | public | Refresh access token |
| POST | /auth/logout | JWT | Invalidate refresh token |
| GET | /auth/me | JWT | Get current user |
| GET | /auth/google | public | Google OAuth redirect |
| GET | /auth/google/callback | public | Google OAuth callback |

### Products — `/products`
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /products | public | Paginated list with filters & search |
| GET | /products/featured | public | Featured products |
| GET | /products/:slug | public | Single product by slug |
| POST | /products | Admin | Create product |
| PATCH | /products/:id | Admin | Update product |
| DELETE | /products/:id | Admin | Soft-delete product |
| POST | /products/:id/images | Admin | Upload images (Cloudinary) |

### Categories — `/categories`
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /categories | public | Full tree |
| GET | /categories/:slug | public | Single category with products |
| POST | /categories | Admin | Create |
| PATCH | /categories/:id | Admin | Update |
| DELETE | /categories/:id | Admin | Delete |

### Cart — `/cart` (Redis-backed, session or user)
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /cart | optional JWT | Get cart |
| POST | /cart/items | optional JWT | Add item |
| PATCH | /cart/items/:variantId | optional JWT | Update quantity |
| DELETE | /cart/items/:variantId | optional JWT | Remove item |
| DELETE | /cart | optional JWT | Clear cart |
| POST | /cart/apply-promo | optional JWT | Apply promo code |

### Orders — `/orders`
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /orders | JWT | User's orders |
| GET | /orders/:id | JWT | Order detail |
| POST | /orders | JWT | Create from cart |
| GET | /admin/orders | Admin | All orders |
| PATCH | /admin/orders/:id/status | Admin | Update status |
| GET | /admin/orders/:id | Admin | Order detail |

### Wishlist — `/wishlist`
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /wishlist | JWT | Get wishlist |
| POST | /wishlist/:productId | JWT | Toggle add/remove |
| DELETE | /wishlist/:productId | JWT | Remove item |

### Reviews — `/reviews`
| Method | Path | Guard | Description |
|---|---|---|---|
| GET | /products/:id/reviews | public | Approved reviews |
| POST | /products/:id/reviews | JWT | Submit review |
| GET | /admin/reviews | Admin | Pending reviews |
| PATCH | /admin/reviews/:id | Admin | Approve / reject |
| DELETE | /admin/reviews/:id | Admin | Delete |

### Admin Stats — `/admin/stats`
| Method | Path | Description |
|---|---|---|
| GET | /admin/stats/overview | KPIs: revenue, orders, customers, conversion |
| GET | /admin/stats/revenue | Revenue chart data (period: 7d/30d/90d) |
| GET | /admin/stats/top-products | Top 10 products by revenue |
| GET | /admin/stats/orders-by-status | Orders grouped by status |

### Notifications (internal) — `/notifications`
| Method | Path | Description |
|---|---|---|
| POST | /notifications/order-confirmation | Email + WhatsApp on order placed |
| POST | /notifications/shipping-update | Email + WhatsApp on status change |
| POST | /notifications/welcome | Welcome email on registration |

---

## Frontend Page Routes (Next.js App Router)

```
app/
├── (storefront)/
│   ├── page.tsx                         Home
│   ├── shop/
│   │   ├── page.tsx                     Shop listing (all products)
│   │   └── [slug]/page.tsx              Category page
│   ├── products/[slug]/page.tsx         Product detail
│   ├── cart/page.tsx                    Cart page
│   ├── checkout/page.tsx                Multi-step checkout
│   ├── wishlist/page.tsx                Wishlist
│   ├── account/
│   │   ├── page.tsx                     Account dashboard
│   │   ├── orders/page.tsx              Orders list
│   │   ├── orders/[id]/page.tsx         Order detail / tracking
│   │   ├── addresses/page.tsx           Saved addresses
│   │   └── settings/page.tsx           Profile settings
│   ├── about/page.tsx                   Brand story
│   ├── gifts/page.tsx                   Gift boxes & packs
│   ├── blog/
│   │   ├── page.tsx                     Blog listing
│   │   └── [slug]/page.tsx              Blog post
│   └── contact/page.tsx                 Contact
│
├── admin/
│   ├── page.tsx                         Analytics overview
│   ├── products/
│   │   ├── page.tsx                     Products table
│   │   ├── new/page.tsx                 Create product
│   │   └── [id]/edit/page.tsx          Edit product
│   ├── categories/page.tsx              Categories tree
│   ├── stock/page.tsx                   Inventory / stock
│   ├── orders/
│   │   ├── page.tsx                     Orders table
│   │   └── [id]/page.tsx               Order detail
│   ├── customers/
│   │   ├── page.tsx                     Customers table
│   │   └── [id]/page.tsx               Customer detail
│   ├── promo/page.tsx                   Promo codes
│   ├── banners/page.tsx                 Homepage banners
│   ├── reviews/page.tsx                 Review moderation
│   └── content/page.tsx                Static content editor
│
├── api/
│   └── auth/[...nextauth]/route.ts
│
├── sitemap.ts                           Dynamic sitemap
├── robots.ts                            robots.txt
└── opengraph-image.tsx                  Default OG image
```

---

## Component Inventory

### Layout
- `<Navbar>` — transparent on hero → glassmorphism on scroll, cart badge, auth menu, search trigger
- `<Footer>` — newsletter signup, social links, legal links, brand tagline
- `<AdminLayout>` — sidebar nav, topbar, breadcrumbs, mobile-responsive

### Storefront
- `<ProductCard>` — image hover zoom, wishlist heart toggle, quick-add CTA, sale/new badge
- `<ProductGrid>` — responsive CSS grid, skeleton loading, empty state
- `<ProductGallery>` — lightbox image viewer with zoom
- `<VariantSelector>` — radio button groups for size/weight/flavor
- `<CartDrawer>` — slide-over from right edge
- `<FilterSidebar>` — sticky desktop, bottom-sheet mobile
- `<SearchModal>` — fullscreen overlay with live search results
- `<ReviewCard>` — star rating, verified badge
- `<BlogCard>` — cover image, category chip, read time

### Admin
- `<DataTable>` — sortable, filterable, bulk actions, pagination (TanStack Table)
- `<StatCard>` — KPI metric with trend indicator
- `<RevenueChart>` — Recharts line chart
- `<OrdersDonut>` — Recharts pie/donut by status
- `<TopProductsBar>` — Recharts horizontal bar
- `<ProductForm>` — multi-section form with image upload drag-drop
- `<BannerManager>` — drag-to-reorder, desktop + mobile image slots

---

## Animation Directives (Framer Motion)

```typescript
// Hero parallax
const { scrollY } = useScroll()
const y = useTransform(scrollY, [0, 500], [0, 150])

// Product card hover
whileHover={{ y: -8, transition: { duration: 0.2 } }}

// Page transitions (AnimatePresence)
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: -20 }}
transition={{ duration: 0.3, ease: "easeOut" }}

// Scroll reveal (staggered children)
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
}

// Cart drawer
initial={{ x: "100%" }}
animate={{ x: 0 }}
exit={{ x: "100%" }}
transition={{ type: "spring", damping: 25, stiffness: 200 }}

// Magnetic CTA buttons — apply useMousePosition hook to offset button slightly toward cursor
```

---

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://luxeuser:luxepass@localhost:5432/luxeshop"
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-jwt-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourbrand.com"

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID="AC..."
TWILIO_AUTH_TOKEN="..."
TWILIO_WHATSAPP_FROM="whatsapp:+14155238886"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="..."

# App URLs
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Payment (Stripe — placeholder)
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Docker Compose Services

```yaml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: luxeshop
      POSTGRES_USER: luxeuser
      POSTGRES_PASSWORD: luxepass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  api:
    build: ./api
    ports: ["3001:3001"]
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgresql://luxeuser:luxepass@postgres:5432/luxeshop
      REDIS_URL: redis://redis:6379

  web:
    build: ./web
    ports: ["3000:3000"]
    depends_on: [api]
    environment:
      NEXT_PUBLIC_API_URL: http://api:3001

  adminer:
    image: adminer
    ports: ["8080:8080"]
    depends_on: [postgres]
    profiles: ["dev"]

volumes:
  postgres_data:
  redis_data:
```

---

## Project Structure

```
/
├── docker-compose.yml
├── docker-compose.dev.yml
├── CONTEXT.md                    ← this file
│
├── api/                          NestJS backend
│   ├── src/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── products/
│   │   ├── categories/
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── wishlist/
│   │   ├── reviews/
│   │   ├── promo/
│   │   ├── banners/
│   │   ├── blog/
│   │   ├── upload/
│   │   ├── notifications/
│   │   ├── stats/
│   │   └── common/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   └── Dockerfile
│
└── web/                          Next.js frontend
    ├── app/
    ├── components/
    │   ├── ui/                   Shadcn base components (customized)
    │   ├── layout/               Navbar, Footer, AdminLayout
    │   ├── shop/                 ProductCard, ProductGrid, CartDrawer…
    │   ├── admin/                DataTable, StatCard, Charts…
    │   └── common/               SearchModal, FilterSidebar…
    ├── lib/
    │   ├── api.ts                Axios instance + interceptors
    │   ├── auth.ts               NextAuth config
    │   └── utils.ts
    ├── hooks/
    │   ├── useCart.ts
    │   ├── useWishlist.ts
    │   └── useInView.ts
    ├── types/
    │   └── index.ts
    ├── public/
    └── Dockerfile
```

---

## Seed Data Specification (prisma/seed.ts)

### Categories (5)
1. Dates & Sweet Treats — `dates-sweets`
2. Gourmet Chocolates — `chocolates`
3. Coffee & Tea — `coffee-tea`
4. Herbal Infusions — `herbal-infusions`
5. Natural Beauty — `natural-beauty`

### Products (20+)
Each product must have: slug, name, description in brand voice, 3+ images (Unsplash URLs OK for seed), variants with stock, basePrice, comparePrice, tags, isFeatured (top 6).

Examples:
- "Medjool Gold Collection" — premium dates box, variants: 250g/500g/1kg
- "Dark Chocolate Dates" — chocolate-coated dates, variants: Original/Almond/Pistachio
- "Atlas Mountain Coffee" — single-origin, variants: Ground/Whole Bean/Pods
- "Rose Hibiscus Infusion" — herbal tea, variants: 20 bags/50 bags/Loose 100g
- "Argan Glow Serum" — beauty, variants: 30ml/50ml

### Users
- admin@luxe.com / Admin123! — role: ADMIN
- sarah@example.com / Test123! — role: CUSTOMER (with 3 past orders)
- ahmed@example.com / Test123! — role: CUSTOMER (with 1 past order)

---

## SEO Requirements

- `generateMetadata()` for every page with title, description, OG tags
- JSON-LD structured data:
  - `Product` schema on product pages
  - `BreadcrumbList` on category/product pages
  - `Organization` on home/about pages
  - `Article` on blog posts
- `app/sitemap.ts` — dynamic, includes all products, categories, blog posts
- `app/robots.ts` — block /admin, /api, /account/*, /checkout
- `app/opengraph-image.tsx` — default OG image with brand colors
- Product pages: `<link rel="canonical">`, proper `alt` on all images

---

## Performance Requirements

- Next.js ISR: product pages `revalidate: 60`, category pages `revalidate: 300`
- Redis cache: product listings TTL 60s, featured products TTL 300s, categories TTL 600s
- All images via `next/image` with proper `sizes` and `priority` on above-fold images
- No layout shift (CLS < 0.1) — reserve image dimensions always
- Skeleton loaders matching exact layout of loaded content
- Lighthouse target: Performance > 90, SEO = 100, Accessibility > 95

---

## Notification Templates

### Order Confirmation Email
- Subject: "Your order #{{orderNumber}} is confirmed ✨"
- Content: order summary table, product thumbnails, delivery address, estimated delivery
- Footer: brand signature, social links, unsubscribe

### Shipping Update Email  
- Subject: "Your order is on its way! 🚚"
- Content: tracking number, carrier, estimated delivery date, order items recap

### WhatsApp Message (order confirmation)
```
Hello {{name}}! 🌿

Your order *#{{orderNumber}}* has been confirmed.

Total: {{total}} MAD
Items: {{itemCount}} products

We'll notify you when it ships. Thank you for choosing {{brandName}}! ✨
```

---

*Last updated: generated by Claude — replace [YOUR_BRAND_NAME] before first deploy.*