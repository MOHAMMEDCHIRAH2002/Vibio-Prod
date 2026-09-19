export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  image?: string;
  role: 'CUSTOMER' | 'ADMIN';
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number };
  sortOrder: number;
}

export interface Variant {
  id: string;
  name: string;
  value: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDesc?: string;
  images: string[];
  categoryId: string;
  category?: Category;
  variants: Variant[];
  tags?: Tag[];
  basePrice: number;
  comparePrice?: number;
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDesc?: string;
  weight?: number;
  reviews?: Review[];
  _count?: { reviews: number };
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  user: { name?: string; image?: string };
  rating: number;
  title?: string;
  body?: string;
  isApproved: boolean;
  createdAt: string;
}

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  variantName: string;
  price: number;
  quantity: number;
  image?: string;
  stock: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  promoCode?: string;
  discount?: number;
  total?: number;
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
  product?: { slug: string };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  shippingAddress: Address;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageDesktop: string;
  imageMobile?: string;
  ctaText?: string;
  ctaLink?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  tags?: Tag[];
  createdAt: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
