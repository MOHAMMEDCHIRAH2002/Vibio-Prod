'use client';

import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { cartApi, getClientSessionId, seedApiSession } from '@/lib/api';
import { Cart } from '@/types';
import { toast } from 'sonner';

export function useCart() {
  const qc = useQueryClient();
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const accessToken = session?.accessToken;
  const mergedRef = useRef<string | null>(null);

  const cartOwner = userId ?? (typeof window !== 'undefined' ? getClientSessionId() : null);

  const { data: cart, isLoading } = useQuery<Cart>({
    queryKey: ['cart', cartOwner],
    queryFn: cartApi.get,
    staleTime: 5 * 60 * 1000,   // serve from cache for 5 min; mutations call setQueryData directly so this is safe
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    enabled: status !== 'loading',
  });

  useEffect(() => {
    if (!userId || !accessToken || mergedRef.current === userId) return;
    const guestSessionId = getClientSessionId();
    if (!guestSessionId) return;
    mergedRef.current = userId;

    // Seed the api cache with the session we already have — avoids a racy getSession() re-fetch
    // that can return before the token is ready and send the merge request unauthenticated.
    seedApiSession(session);
    cartApi
      .merge(guestSessionId)
      .then((merged) => {
        qc.setQueryData(['cart', userId], merged);
      })
      .catch(() => {
        qc.invalidateQueries({ queryKey: ['cart'] });
      });
  }, [userId, accessToken, session, qc]);

  const addItem = useMutation({
    mutationFn: ({ variantId, quantity = 1 }: { variantId: string; quantity?: number }) =>
      cartApi.addItem(variantId, quantity),
    onSuccess: (data) => {
      qc.setQueryData(['cart', cartOwner], data);
      toast.success('Added to cart');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to add item'),
  });

  const updateItem = useMutation({
    mutationFn: ({ variantId, quantity }: { variantId: string; quantity: number }) =>
      cartApi.updateItem(variantId, quantity),
    onSuccess: (data) => qc.setQueryData(['cart', cartOwner], data),
    onError: (err: any) => toast.error(err.message || 'Failed to update cart'),
  });

  const removeItem = useMutation({
    mutationFn: (variantId: string) => cartApi.removeItem(variantId),
    onSuccess: (data) => {
      qc.setQueryData(['cart', cartOwner], data);
      toast.success('Removed from cart');
    },
  });

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  return {
    cart,
    isLoading,
    itemCount,
    addItem,
    updateItem,
    removeItem,
  };
}
