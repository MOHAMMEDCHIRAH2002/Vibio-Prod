import Image, { ImageProps } from 'next/image';

type OptimizedProps = Omit<ImageProps, 'priority'> & {
  priority?: boolean;
};

export default function OptimizedImage(props: OptimizedProps) {
  const { src, alt, width, height, sizes, priority = false, ...rest } = props as any;

  // Encourage explicit sizes for best CLS behavior. If width/height are missing
  // allow `fill` with a wrapper that sets aspect ratio in the caller.
  return (
    <Image
      src={src}
      alt={alt ?? ''}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      {...(rest as any)}
    />
  );
}
