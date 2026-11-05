import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const CartContext = createContext(null);
const EMPTY = { items: [], subtotal: 0, shipping: 0, tax: 0, total: 0, itemCount: 0 };

export function CartProvider({ children }) {
  const [cart, setCart] = useState(EMPTY);
  const [toast, setToast] = useState('');

  const refresh = useCallback(() => api.cart().then(setCart).catch(() => {}), []);
  useEffect(() => {
    refresh();
  }, [refresh]);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  const run = async (fn, successMsg) => {
    try {
      setCart(await fn());
      if (successMsg) notify(successMsg);
      return true;
    } catch (err) {
      notify(err.message);
      return false;
    }
  };

  const value = {
    cart,
    refresh,
    addToCart: (id, qty = 1) => run(() => api.addToCart(id, qty), 'Added to cart ✓'),
    updateQty: (id, qty) => run(() => api.updateCart(id, qty)),
    remove: (id) => run(() => api.removeFromCart(id), 'Removed from cart'),
    notify,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast && <div className="toast" role="status">{toast}</div>}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
