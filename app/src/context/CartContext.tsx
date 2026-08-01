import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Artwork, CartItem } from '../types/artwork';

interface CartContextValue {
  items: CartItem[];
  addItem: (artwork: Artwork) => void;
  removeItem: (artworkId: string) => void;
  updateQuantity: (artworkId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((artwork: Artwork) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.artwork.id === artwork.id);
      if (existing) {
        return prev.map((i) =>
          i.artwork.id === artwork.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { artwork, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((artworkId: string) => {
    setItems((prev) => prev.filter((i) => i.artwork.id !== artworkId));
  }, []);

  const updateQuantity = useCallback((artworkId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.artwork.id !== artworkId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.artwork.id === artworkId ? { ...i, quantity } : i)),
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalCents = items.reduce((sum, i) => sum + i.artwork.priceCents * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalCents }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
