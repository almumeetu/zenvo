'use client';

import { useApp } from '@/lib/AppStateContext';
import { Header } from './Header';

export function HeaderWrapper() {
  const {
    products,
    selectedCurrency,
    setSelectedCurrency,
    user,
    cartItems,
  } = useApp();

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
