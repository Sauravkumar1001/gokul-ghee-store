import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

const CART_STORAGE_KEY = 'gokul_ghee_cart_v1';

const CartContext = createContext(null);

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [pincode, setPincode] = useState('801503');

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota restrictions
    }
  }, [items]);

  const addItem = useCallback((product, variant, quantity = 1, { openCartDrawer = true } = {}) => {
    if (!product || !variant) return;
    const safeQty = Math.max(1, Number(quantity) || 1);
    const resolvedProductId = product.id || String(product._id);
    const resolvedVariantId = variant.id || String(variant._id);

    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.variantId === resolvedVariantId);
      if (existingIndex > -1) {
        return prev.map((item, idx) => {
          if (idx !== existingIndex) return item;
          const maxStock = variant.stock || 99;
          return {
            ...item,
            quantity: Math.min(maxStock, item.quantity + safeQty),
          };
        });
      }

      return [
        ...prev,
        {
          productId: resolvedProductId,
          slug: product.slug,
          name: product.name,
          categoryName: product.categoryName,
          image: product.images[0],
          variantId: resolvedVariantId,
          variantLabel: variant.label,
          price: variant.price,
          mrp: variant.mrp,
          stock: variant.stock,
          isSampleData: Boolean(product.isSampleData),
          quantity: Math.min(variant.stock || 99, safeQty),
        },
      ];
    });

    analyticsService.trackEvent({
      eventType: 'ADD_TO_CART',
      productId: product._id || null,
      metadata: {
        slug: product.slug,
        variantLabel: variant.label,
        quantity: safeQty,
        unitPrice: variant.price,
      },
    });

    if (openCartDrawer) {
      setIsDrawerOpen(true);
    }
  }, []);

  const updateQuantity = useCallback((variantId, nextQuantity) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.variantId !== variantId) return item;
          if (nextQuantity <= 0) return null;
          const maxStock = item.stock || 99;
          return { ...item, quantity: Math.min(maxStock, nextQuantity) };
        })
        .filter(Boolean)
    );
  }, []);

  const removeItem = useCallback((variantId) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setCouponCode('');
  }, []);

  const totals = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const mrpTotal = items.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
    const totalSavings = Math.max(0, mrpTotal - subtotal);
    return { itemCount, subtotal, mrpTotal, totalSavings };
  }, [items]);

  const value = useMemo(
    () => ({
      items,
      ...totals,
      couponCode,
      setCouponCode,
      pincode,
      setPincode,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      totals,
      couponCode,
      pincode,
      isDrawerOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
