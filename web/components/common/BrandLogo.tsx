import Image from '@/components/common/OptimizedImage';
import { cn } from '@/lib/utils';

type BrandLogoProps = {
  className?: string;
  sizes?: string;
  priority?: boolean;
  align?: 'center' | 'left';
  trimPadding?: boolean;
};

export default function BrandLogo({
  className,
  sizes = '192px',
  priority = false,
  align = 'center',
  trimPadding = false,
}: BrandLogoProps) {
  return (
    <span className={cn('relative block', trimPadding && 'overflow-hidden', className)}>
      <Image
        src="/VIBIO-LOGO.png"
        alt="Vibio"
        fill
        priority={priority}
        sizes={sizes}
        className={cn(
          'object-contain',
          // The shared PNG has large transparent padding; trim mode scales into the visible mark.
          trimPadding && 'scale-[2.2] transform-gpu',
          trimPadding && (align === 'left' ? 'origin-left' : 'origin-center'),
          align === 'left' ? 'object-left' : 'object-center',
        )}
        style={
          trimPadding
            ? { objectPosition: align === 'left' ? 'left 52%' : 'center 52%' }
            : undefined
        }
      />
    </span>
  );
}
