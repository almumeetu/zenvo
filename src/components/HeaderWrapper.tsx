'use client';

import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/AppStateContext';
import { Header } from './Header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const {
    products,
    selectedCurrency,
    setSelectedCurrency,
    user,
    cartItems,
  } = useApp();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <Header
      products={products}
      selectedCurrency={selectedCurrency}
      onSelectCurrency={setSelectedCurrency}
      user={user}
      cartItems={cartItems}
    />
  );
}
