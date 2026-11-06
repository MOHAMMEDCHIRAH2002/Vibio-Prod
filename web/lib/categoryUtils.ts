import type { Category } from '@/types';

export function categoriesWithProducts(categories: Category[]): Category[] {
  return categories.reduce<Category[]>((visible, category) => {
    const children = categoriesWithProducts(category.children ?? []);
    if ((category._count?.products ?? 0) > 0) {
      visible.push({ ...category, children });
    } else {
      visible.push(...children);
    }
    return visible;
  }, []);
}
