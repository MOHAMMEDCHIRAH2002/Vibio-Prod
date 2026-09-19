import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string | { toNumber?: () => number } | null | undefined, currency = 'MAD'): string {
  const num = price == null ? 0 : typeof price === 'object' && typeof (price as any).toNumber === 'function' ? (price as any).toNumber() : Number(price);
  return `${isNaN(num) ? '0.00' : num.toFixed(2)} ${currency}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '…';
}

export function getDiscountPercent(base: number, compare: number): number {
  return Math.round(((compare - base) / compare) * 100);
}

export function getMinVariantPrice(variants: { price: number }[]): number {
  if (!variants?.length) return 0;
  return Math.min(...variants.map((v) => v.price));
}

export function getStockStatus(variants: { stock: number }[]): 'in-stock' | 'low-stock' | 'out-of-stock' {
  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
  if (totalStock === 0) return 'out-of-stock';
  if (totalStock < 5) return 'low-stock';
  return 'in-stock';
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-[#F4E5C6] text-[#8A631D]',
    CONFIRMED: 'bg-[#E2ECE6] text-[#2F5E49]',
    PROCESSING: 'bg-[#ECE4F3] text-[#6A4B88]',
    SHIPPED: 'bg-[#E4ECF4] text-[#44637C]',
    DELIVERED: 'bg-[#E0EEE6] text-[#2A6A45]',
    CANCELLED: 'bg-[#F7E3DE] text-[#C9571A]',
    REFUNDED: 'bg-[#ECE7E1] text-[#665E55]',
  };
  return colors[status] || 'bg-[#ECE7E1] text-[#665E55]';
}

export function readingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}
