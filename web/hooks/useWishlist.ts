'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { wishlistApi } from '@/lib/api';
import { useSession } from 'next-auth/react';

export function useWishlist() {
  const { data: session, status } = useSession();
  const qc = useQueryClient();

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.get,
    // Only fire when the session is fully established AND has a valid token
    enabled: status === 'authenticated' && !!session?.accessToken && !session?.error,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const toggle = useMutation({
    mutationFn: (productId: string) => wishlistApi.toggle(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isWishlisted = (productId: string) =>
    Array.isArray(wishlist) && wishlist.some((w: any) => w.productId === productId);

  return { wishlist, isWishlisted, toggle };
}
