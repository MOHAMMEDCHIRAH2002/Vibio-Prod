'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import { seedApiSession } from '@/lib/api';
import I18nProvider from '@/components/i18n/I18nProvider';
import CookieConsent from '@/components/common/CookieConsent';

// Pre-seeds the axios session cache as soon as NextAuth establishes the session.
// This prevents the first authenticated requests from going out without an auth header.
function SessionSyncer() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session) seedApiSession(session);
  }, [session]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: false, // don't retry failed queries — 401s should not be retried
          },
        },
      }),
  );

  return (
    <SessionProvider refetchInterval={8 * 60} refetchOnWindowFocus={false}>
      <QueryClientProvider client={queryClient}>
        <SessionSyncer />
        <I18nProvider>
          {children}
          <CookieConsent />
        </I18nProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1C1C1C',
              color: '#FAF7F2',
              border: '1px solid #C9A96E',
              borderRadius: '4px',
            },
          }}
        />
      </QueryClientProvider>
    </SessionProvider>
  );
}
