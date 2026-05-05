import type { DefaultOptions } from '@tanstack/react-query';
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { memo } from 'react';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/ThemeProvider';
import { logger } from '@/lib/logger';
import type { FCC } from '@/types';

interface Props {}

const queryOption: DefaultOptions['queries'] = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

const queryClient = new QueryClient({
  defaultOptions: { queries: queryOption },
  queryCache: new QueryCache({
    onError: (error, query) => {
      logger.error('API query failed', {
        queryKey: query.queryKey,
        reason: error instanceof Error ? error.message : String(error),
      });
    },
  }),
});

const Provider: FCC<Props> = ({ children }) => {
  const [_queryClient] = React.useState(() => queryClient);

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light">
        <QueryClientProvider client={_queryClient}>
          {children}
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ThemeProvider>
      <Toaster />
    </>
  );
};

export default memo(Provider);
