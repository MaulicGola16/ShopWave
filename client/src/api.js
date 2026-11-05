// Thin fetch wrapper. A random session id (stored in localStorage) scopes the cart and orders.
function getSessionId() {
  let id = localStorage.getItem('shopwave-session');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('shopwave-session', id);
  }
  return id;
}

async function request(path, { method = 'GET', body } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Session-Id': getSessionId() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  categories: () => request('/categories'),
  products: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return request(`/products?${qs}`);
  },
  product: (id) => request(`/products/${id}`),
  cart: () => request('/cart'),
  addToCart: (productId, quantity = 1) => request('/cart', { method: 'POST', body: { productId, quantity } }),
  updateCart: (productId, quantity) => request(`/cart/${productId}`, { method: 'PATCH', body: { quantity } }),
  removeFromCart: (productId) => request(`/cart/${productId}`, { method: 'DELETE' }),
  createOrder: (customer) => request('/orders', { method: 'POST', body: { customer } }),
  orders: () => request('/orders'),
  pay: (payload) => request('/payments', { method: 'POST', body: payload }),
};

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
