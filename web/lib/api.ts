import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import type {
  Cart,
  Category,
  Order,
  PaginatedResponse,
  Product,
  Review,
  Banner,
  BlogPost,
  Address,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const SESSION_REFRESH_SKEW_MS = 60 * 1000; // refresh if token expires within 60 s

type SessionLike = Awaited<ReturnType<typeof getSession>>;
let cachedSession: SessionLike = null;
let inflightSession: Promise<SessionLike> | null = null;

function isSessionExpiringSoon(session: SessionLike): boolean {
  if (!session?.accessTokenExpires) return false;
  return Date.now() > (session.accessTokenExpires as number) - SESSION_REFRESH_SKEW_MS;
}

async function ensureSession(forceRefresh = false): Promise<SessionLike> {
  if (typeof window === 'undefined') return null;

  const needsRefresh =
    forceRefresh ||
    !cachedSession ||
    !cachedSession.accessToken ||
    !!cachedSession.error ||
    isSessionExpiringSoon(cachedSession); // only refresh near expiry, not constantly

  if (!needsRefresh) return cachedSession;

  if (!inflightSession) {
    inflightSession = getSession().finally(() => {
      inflightSession = null;
    });
  }
  cachedSession = await inflightSession;
  return cachedSession;
}

export function invalidateApiSession() {
  cachedSession = null;
}

export function seedApiSession(session: SessionLike) {
  cachedSession = session;
}

function getOrCreateSessionId(): string | null {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('sessionId');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem('sessionId', id);
  }
  return id;
}

export function getClientSessionId(): string | null {
  return getOrCreateSessionId();
}

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  // Do not block the request on a session fetch when possible.
  // Prefer the cached session token; only await an inflight session if one already exists.
  if (typeof window === 'undefined') return config;

  if (cachedSession?.accessToken) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${cachedSession.accessToken}`;
  } else if (inflightSession) {
    try {
      const s = await inflightSession;
      if (s?.accessToken) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${s.accessToken}`;
      }
    } catch {
      // ignore - we'll let the response interceptor handle 401s
    }
  } else {
    // Kick off a background session fetch but don't await it here.
    ensureSession().catch(() => {});
  }

  const sessionId = getOrCreateSessionId();
  if (sessionId) {
    config.headers = config.headers ?? {};
    (config.headers as any)['x-session-id'] = sessionId;
  }

  // Optional telemetry: measure request duration when `NEXT_PUBLIC_DEBUG_PERF` is set.
  try {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_PERF === '1') {
      (config as any).__startTime = Date.now();
    }
  } catch {}

  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (status === 401 && original && !original._retry) {
      original._retry = true;
      const refreshed = await ensureSession(true);
      if (refreshed?.accessToken && !refreshed.error) {
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${refreshed.accessToken}`;
        return api.request(original);
      }
      // Only force sign-out when the session explicitly signals an auth error.
      // A null or accessToken-less session can be a transient timing state
      // (e.g. right after an OAuth redirect) — signing out there would be wrong.
      if (typeof window !== 'undefined' && refreshed?.error) {
        await signOut({ redirect: false });
      }
    }

    const payload = (error.response?.data as any) ?? { message: error.message };
    return Promise.reject(payload);
  },
);

// Response timing - non-blocking and gated behind env var.
api.interceptors.response.use(
  (res) => {
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_PERF === '1') {
        const start = (res.config as any).__startTime;
        if (start) {
          const dur = Date.now() - start;
          if (dur > 300) console.warn(`Slow API response: ${res.config.url} ${dur}ms`);
        }
      }
    } catch {}
    return res;
  },
  (err) => {
    try {
      if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DEBUG_PERF === '1') {
        const start = (err.config as any)?.__startTime;
        if (start) {
          const dur = Date.now() - start;
          console.warn(`API error after ${dur}ms: ${err.config?.url}`);
        }
      }
    } catch {}
    return Promise.reject(err);
  },
);

// The response interceptor unwraps `res.data`, so each method returns the payload directly.
const request = <T>(config: AxiosRequestConfig): Promise<T> =>
  api.request<T, T>(config);

// Products
export const productsApi = {
  list: (params?: Record<string, any>) =>
    request<PaginatedResponse<Product>>({ method: 'GET', url: '/products', params }),
  featured: () => request<Product[]>({ method: 'GET', url: '/products/featured' }),
  bySlug: (slug: string) => request<Product>({ method: 'GET', url: `/products/${slug}` }),
  getById: (id: string) => request<Product>({ method: 'GET', url: `/products/by-id/${id}` }),
  create: (data: any) => request<Product>({ method: 'POST', url: '/products', data }),
  update: (id: string, data: any) =>
    request<Product>({ method: 'PATCH', url: `/products/${id}`, data }),
  delete: (id: string) => request<void>({ method: 'DELETE', url: `/products/${id}` }),
  uploadImages: (id: string, files: File[]) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    return request<{ urls: string[] }>({
      method: 'POST',
      url: `/products/${id}/images`,
      data: fd,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Categories
export const categoriesApi = {
  list: () => request<Category[]>({ method: 'GET', url: '/categories' }),
  bySlug: (slug: string) => request<Category>({ method: 'GET', url: `/categories/${slug}` }),
  create: (data: any) => request<Category>({ method: 'POST', url: '/categories', data }),
  update: (id: string, data: any) =>
    request<Category>({ method: 'PATCH', url: `/categories/${id}`, data }),
  delete: (id: string) => request<void>({ method: 'DELETE', url: `/categories/${id}` }),
};

// Cart
export const cartApi = {
  get: () => request<Cart>({ method: 'GET', url: '/cart' }),
  addItem: (variantId: string, quantity = 1) =>
    request<Cart>({ method: 'POST', url: '/cart/items', data: { variantId, quantity } }),
  updateItem: (variantId: string, quantity: number) =>
    request<Cart>({ method: 'PATCH', url: `/cart/items/${variantId}`, data: { quantity } }),
  removeItem: (variantId: string) =>
    request<Cart>({ method: 'DELETE', url: `/cart/items/${variantId}` }),
  clear: () => request<void>({ method: 'DELETE', url: '/cart' }),
  merge: (sessionId: string) =>
    request<Cart>({ method: 'POST', url: '/cart/merge', data: { sessionId } }),
};

// Auth
export const authApi = {
  register: (data: any) => request<any>({ method: 'POST', url: '/auth/register', data }),
  login: (data: any) => request<any>({ method: 'POST', url: '/auth/login', data }),
  logout: () => request<void>({ method: 'POST', url: '/auth/logout' }),
  me: () => request<User>({ method: 'GET', url: '/auth/me' }),
  forgotPassword: (email: string) =>
    request<{ message: string }>({ method: 'POST', url: '/auth/forgot-password', data: { email } }),
  resetPassword: (token: string, password: string) =>
    request<{ message: string }>({ method: 'POST', url: '/auth/reset-password', data: { token, password } }),
};

// Orders
export const ordersApi = {
  list: (params?: any) => request<Order[]>({ method: 'GET', url: '/orders', params }),
  byId: (id: string) => request<Order>({ method: 'GET', url: `/orders/${id}` }),
  create: (data: any, idempotencyKey?: string) =>
    request<Order>({
      method: 'POST',
      url: '/orders',
      data,
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    }),
  adminList: (params?: any) =>
    request<PaginatedResponse<Order>>({ method: 'GET', url: '/admin/orders', params }),
  adminById: (id: string) => request<Order>({ method: 'GET', url: `/admin/orders/${id}` }),
  updateStatus: (id: string, data: any) =>
    request<Order>({ method: 'PATCH', url: `/admin/orders/${id}/status`, data }),
  listByCustomer: (customerId: string) =>
    request<PaginatedResponse<Order>>({
      method: 'GET',
      url: `/admin/orders`,
      params: { customerId },
    }),
};

// Promo codes
export interface PromoPreview {
  code: string;
  type: 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';
  value: number;
  discount: number;
  freeShipping: boolean;
  message: string;
}

export const promoApi = {
  // Public — validate/preview a code at checkout.
  validate: (data: { code: string; subtotal: number }) =>
    request<PromoPreview>({ method: 'POST', url: '/promo/validate', data }),
  // Admin CRUD.
  adminList: () => request<any[]>({ method: 'GET', url: '/admin/promo' }),
  adminCreate: (data: any) => request<any>({ method: 'POST', url: '/admin/promo', data }),
  adminUpdate: (id: string, data: any) =>
    request<any>({ method: 'PATCH', url: `/admin/promo/${id}`, data }),
  adminDelete: (id: string) => request<void>({ method: 'DELETE', url: `/admin/promo/${id}` }),
};

// Customer request submissions (centralized owner notifications)
export interface Submission {
  id: string;
  type: 'CONTACT' | 'CALLBACK' | 'PRODUCT_INQUIRY' | 'NEWSLETTER' | 'ORDER_MODIFICATION' | 'SUPPORT';
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  subject?: string | null;
  message?: string | null;
  orderId?: string | null;
  productId?: string | null;
  meta?: any;
  handled: boolean;
  createdAt: string;
}

export const submissionsApi = {
  contact: (data: { name: string; email: string; subject?: string; message: string; website?: string }) =>
    request<{ ok: boolean; id: string | null }>({ method: 'POST', url: '/submissions/contact', data }),
  callback: (data: { name: string; phone: string; preferredTime?: string; message?: string; website?: string }) =>
    request<{ ok: boolean; id: string | null }>({ method: 'POST', url: '/submissions/callback', data }),
  inquiry: (data: { name: string; email?: string; phone?: string; productId?: string; productName?: string; message: string; website?: string }) =>
    request<{ ok: boolean; id: string | null }>({ method: 'POST', url: '/submissions/inquiry', data }),
  newsletter: (data: { email: string; website?: string }) =>
    request<{ ok: boolean; id: string | null }>({ method: 'POST', url: '/submissions/newsletter', data }),
  orderModification: (data: { orderId: string; message: string }) =>
    request<{ ok: boolean; id: string | null }>({ method: 'POST', url: '/submissions/order-modification', data }),
  // Admin
  adminList: (params?: { page?: number; limit?: number; type?: string }) =>
    request<{ items: Submission[]; total: number; page: number; pages: number }>({
      method: 'GET',
      url: '/admin/submissions',
      params,
    }),
  setHandled: (id: string, handled: boolean) =>
    request<Submission>({ method: 'PATCH', url: `/admin/submissions/${id}`, data: { handled } }),
};

// Loyalty points
export interface LoyaltyTransaction {
  id: string;
  type: 'EARN' | 'REDEEM' | 'REVERSE';
  points: number;
  reason: string;
  orderNumber: string | null;
  createdAt: string;
}

export interface LoyaltySummary {
  points: number;
  value: number;
  config: {
    pointsPerMad: number;
    redeemStep: number;
    redeemStepValue: number;
    minRedeem: number;
  };
  transactions: LoyaltyTransaction[];
}

export const loyaltyApi = {
  me: () => request<LoyaltySummary>({ method: 'GET', url: '/loyalty/me' }),
};

// Wishlist
export const wishlistApi = {
  get: () => request<Product[]>({ method: 'GET', url: '/wishlist' }),
  toggle: (productId: string) =>
    request<{ added: boolean }>({ method: 'POST', url: `/wishlist/${productId}` }),
  remove: (productId: string) =>
    request<void>({ method: 'DELETE', url: `/wishlist/${productId}` }),
};

// Reviews
export const reviewsApi = {
  byProduct: (productId: string) =>
    request<Review[]>({ method: 'GET', url: `/products/${productId}/reviews` }),
  create: (productId: string, data: any) =>
    request<Review>({ method: 'POST', url: `/products/${productId}/reviews`, data }),
  adminList: (params?: any) =>
    request<PaginatedResponse<Review>>({ method: 'GET', url: '/admin/reviews', params }),
  adminCreate: (data: any) =>
    request<Review>({ method: 'POST', url: '/admin/reviews', data }),
  moderate: (id: string, action: string) =>
    request<Review>({ method: 'PATCH', url: `/admin/reviews/${id}`, data: { action } }),
  delete: (id: string) => request<void>({ method: 'DELETE', url: `/admin/reviews/${id}` }),
};

// Banners
export const bannersApi = {
  list: () => request<Banner[]>({ method: 'GET', url: '/banners' }),
  adminList: () => request<Banner[]>({ method: 'GET', url: '/banners/admin' }),
  create: (data: any) => request<Banner>({ method: 'POST', url: '/banners/admin', data }),
  update: (id: string, data: any) =>
    request<Banner>({ method: 'PATCH', url: `/banners/admin/${id}`, data }),
  delete: (id: string) => request<void>({ method: 'DELETE', url: `/banners/admin/${id}` }),
  reorder: (ids: string[]) =>
    request<void>({ method: 'PATCH', url: '/banners/admin/reorder', data: { ids } }),
};

// Blog
export const blogApi = {
  list: (params?: any) =>
    request<PaginatedResponse<BlogPost>>({ method: 'GET', url: '/blog', params }),
  bySlug: (slug: string) => request<BlogPost>({ method: 'GET', url: `/blog/${slug}` }),
  adminList: (params?: any) =>
    request<PaginatedResponse<BlogPost>>({ method: 'GET', url: '/admin/blog', params }),
  create: (data: any) => request<BlogPost>({ method: 'POST', url: '/admin/blog', data }),
  update: (id: string, data: any) =>
    request<BlogPost>({ method: 'PATCH', url: `/admin/blog/${id}`, data }),
  delete: (id: string) => request<void>({ method: 'DELETE', url: `/admin/blog/${id}` }),
};

// Stats
export const statsApi = {
  overview: () => request<any>({ method: 'GET', url: '/admin/stats/overview' }),
  revenue: (period = '30d') =>
    request<any>({ method: 'GET', url: '/admin/stats/revenue', params: { period } }),
  topProducts: () => request<any>({ method: 'GET', url: '/admin/stats/top-products' }),
  ordersByStatus: () => request<any>({ method: 'GET', url: '/admin/stats/orders-by-status' }),
};

// Account
export const accountApi = {
  getProfile: () => request<User>({ method: 'GET', url: '/auth/me' }),
  updateProfile: (data: any) => request<User>({ method: 'PATCH', url: '/account/profile', data }),
  changePassword: (data: any) =>
    request<void>({ method: 'PATCH', url: '/account/password', data }),
  getAddresses: () => request<Address[]>({ method: 'GET', url: '/account/addresses' }),
  createAddress: (data: any) =>
    request<Address>({ method: 'POST', url: '/account/addresses', data }),
  addAddress: (data: any) =>
    request<Address>({ method: 'POST', url: '/account/addresses', data }),
  updateAddress: (id: string, data: any) =>
    request<Address>({ method: 'PATCH', url: `/account/addresses/${id}`, data }),
  deleteAddress: (id: string) =>
    request<void>({ method: 'DELETE', url: `/account/addresses/${id}` }),
  setDefaultAddress: (id: string) =>
    request<Address>({ method: 'PATCH', url: `/account/addresses/${id}/default`, data: {} }),
  getCustomer: (id: string) => request<User>({ method: 'GET', url: `/admin/customers/${id}` }),
};

