import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import { Product } from '@/types';

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  count?: number;
  cols?: 3 | 4;
}

export default function ProductGrid({ products, isLoading, count = 8, cols = 4 }: ProductGridProps) {
  const gridClass = cols === 3
    ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4';

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="col-span-full">
        <div className="surface-panel py-20 text-center">
          <p className="font-heading text-[2rem] leading-none tracking-[-0.05em] text-text-dark">
            No products found
          </p>
          <p className="mt-3 text-sm text-text-muted">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} priority={i < 4} index={i} />
      ))}
    </div>
  );
}
