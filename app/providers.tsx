// app/providers.tsx
'use client';

import { memo } from 'react';
import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider } from '@chakra-ui/react';
import { CartProvider } from '../context/CartContext';

export const Providers = memo(({ children }: { children: React.ReactNode }) => {
  return (
    <CacheProvider>
      <ChakraProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ChakraProvider>
    </CacheProvider>
  );
});
