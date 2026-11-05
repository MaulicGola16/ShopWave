// ShopWave REST API — zero-dependency Node.js server.
// Modules: Catalogue, Cart, Orders, Payments.
import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { products, categories } from './data/products.js';
import state, { persist } from './store.js';

const PORT = process.env.PORT || 5000;
const SHIPPING_FREE_ABOVE = 999;
const SHIPPING_FEE = 79;
const TAX_RATE = 0.05; // 5% GST (demo)

// ---------- helpers ----------
const send = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Id',
    'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
  });
  res.end(JSON.stringify(body));
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new HttpError(413, 'Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new HttpError(400, 'Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });

const findProduct = (id) => products.find((x) => x.id === Number(id));
const withStock = (prod) => ({ ...prod, stock: state.stock[prod.id] ?? 0 });
const money = (n) => Math.round(n * 100) / 100;

const sessionOf = (req) => String(req.headers['x-session-id'] || 'guest').slice(0, 64);

function cartView(sessionId) {
  const lines = (state.carts[sessionId] || [])
    .map((l) => {
      const product = findProduct(l.productId);
      return product ? { productId: l.productId, quantity: l.quantity, product: withStock(product) } : null;
    })
    .filter(Boolean);
  return { items: lines, ...totals(lines) };
}

function totals(lines) {
  const subtotal = money(lines.reduce((s, l) => s + l.product.price * l.quantity, 0));
  const shipping = subtotal === 0 || subtotal >= SHIPPING_FREE_ABOVE ? 0 : SHIPPING_FEE;
  const tax = money(subtotal * TAX_RATE);
  const total = money(subtotal + shipping + tax);
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);
  return { subtotal, shipping, tax, total, itemCount };
}

const luhnValid = (num) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
};

// ---------- route handlers ----------
const routes = [];
const route = (method, pattern, handler) => {
  const keys = [];
  const regex = new RegExp(
    '^' + pattern.replace(/:([a-zA-Z]+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '/?$'
  );
  routes.push({ method, regex, keys, handler });
};

route('GET', '/api/health', () => ({ status: 200, body: { ok: true, time: new Date().toISOString() } }));

// ---- Catalogue ----
route('GET', '/api/categories', () => ({
  status: 200,
  body: categories.map((c) => ({ ...c, count: products.filter((x) => x.category === c.id).length })),
}));

route('GET', '/api/products', ({ query }) => {
  let list = products.map(withStock);
  if (query.category) list = list.filter((x) => x.category === query.category);
  if (query.search) {
    const q = query.search.toLowerCase();
    list = list.filter((x) => [x.name, x.brand, x.category].some((f) => f.toLowerCase().includes(q)));
  }
  if (query.minPrice) list = list.filter((x) => x.price >= Number(query.minPrice));
  if (query.maxPrice) list = list.filter((x) => x.price <= Number(query.maxPrice));
  const sorters = {
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
    name: (a, b) => a.name.localeCompare(b.name),
  };
  if (sorters[query.sort]) list.sort(sorters[query.sort]);
  if (query.limit) list = list.slice(0, Math.max(1, Number(query.limit)));
  return { status: 200, body: list };
});

route('GET', '/api/products/:id', ({ params }) => {
  const prod = findProduct(params.id);
  if (!prod) throw new HttpError(404, 'Product not found');
  const related = products
    .filter((x) => x.category === prod.category && x.id !== prod.id)
    .slice(0, 4)
    .map(withStock);
  return { status: 200, body: { ...withStock(prod), related } };
});

// ---- Cart ----
route('GET', '/api/cart', ({ session }) => ({ status: 200, body: cartView(session) }));

route('POST', '/api/cart', ({ session, body }) => {
  const prod = findProduct(body.productId);
  if (!prod) throw new HttpError(404, 'Product not found');
  const qty = Math.max(1, Math.floor(Number(body.quantity) || 1));
  const cart = (state.carts[session] ||= []);
  const line = cart.find((l) => l.productId === prod.id);
  const newQty = (line?.quantity || 0) + qty;
  if (newQty > state.stock[prod.id]) throw new HttpError(409, `Only ${state.stock[prod.id]} left in stock`);
  if (line) line.quantity = newQty;
  else cart.push({ productId: prod.id, quantity: newQty });
  persist();
  return { status: 201, body: cartView(session) };
});

route('PATCH', '/api/cart/:productId', ({ session, params, body }) => {
  const cart = state.carts[session] || [];
  const line = cart.find((l) => l.productId === Number(params.productId));
  if (!line) throw new HttpError(404, 'Item not in cart');
  const qty = Math.floor(Number(body.quantity));
  if (!Number.isFinite(qty) || qty < 1) throw new HttpError(400, 'Quantity must be at least 1');
  if (qty > state.stock[line.productId]) throw new HttpError(409, `Only ${state.stock[line.productId]} left in stock`);
  line.quantity = qty;
  persist();
  return { status: 200, body: cartView(session) };
});

route('DELETE', '/api/cart/:productId', ({ session, params }) => {
  state.carts[session] = (state.carts[session] || []).filter((l) => l.productId !== Number(params.productId));
  persist();
  return { status: 200, body: cartView(session) };
});

route('DELETE', '/api/cart', ({ session }) => {
  state.carts[session] = [];
  persist();
  return { status: 200, body: cartView(session) };
});

// ---- Orders ----
route('POST', '/api/orders', ({ session, body }) => {
  const cart = cartView(session);
  if (!cart.items.length) throw new HttpError(400, 'Your cart is empty');

  const c = body.customer || {};
  const missing = ['name', 'email', 'phone', 'address', 'city', 'pincode'].filter((k) => !String(c[k] || '').trim());
  if (missing.length) throw new HttpError(400, `Missing shipping details: ${missing.join(', ')}`);
  if (!/^\S+@\S+\.\S+$/.test(c.email)) throw new HttpError(400, 'Enter a valid email address');
  if (!/^\d{6}$/.test(String(c.pincode))) throw new HttpError(400, 'Pincode must be 6 digits');

  for (const l of cart.items) {
    if (l.quantity > state.stock[l.productId]) throw new HttpError(409, `${l.product.name} is out of stock`);
  }

  const order = {
    id: 'ORD-' + randomUUID().slice(0, 8).toUpperCase(),
    sessionId: session,
    status: 'PENDING_PAYMENT',
    createdAt: new Date().toISOString(),
    customer: {
      name: c.name.trim(),
      email: c.email.trim(),
      phone: String(c.phone).trim(),
      address: c.address.trim(),
      city: c.city.trim(),
      pincode: String(c.pincode),
    },
    items: cart.items.map((l) => ({
      productId: l.productId,
      name: l.product.name,
      emoji: l.product.emoji,
      price: l.product.price,
      quantity: l.quantity,
    })),
    subtotal: cart.subtotal,
    shipping: cart.shipping,
    tax: cart.tax,
    total: cart.total,
    payment: null,
  };
  state.orders.push(order);
  persist();
  return { status: 201, body: order };
});

route('GET', '/api/orders', ({ session }) => ({
  status: 200,
  body: state.orders.filter((o) => o.sessionId === session).reverse(),
}));

route('GET', '/api/orders/:id', ({ session, params }) => {
  const order = state.orders.find((o) => o.id === params.id && o.sessionId === session);
  if (!order) throw new HttpError(404, 'Order not found');
  return { status: 200, body: order };
});

// ---- Payments (SIMULATED — no real gateway; plug in Razorpay/Stripe here) ----
route('POST', '/api/payments', ({ session, body }) => {
  const order = state.orders.find((o) => o.id === body.orderId && o.sessionId === session);
  if (!order) throw new HttpError(404, 'Order not found');
  if (order.status !== 'PENDING_PAYMENT') throw new HttpError(409, 'This order has already been paid');

  const method = body.method;
  let detail;

  if (method === 'card') {
    const num = String(body.card?.number || '').replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(num) || !luhnValid(num)) throw new HttpError(402, 'Invalid card number');
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(body.card?.expiry || '')) throw new HttpError(402, 'Expiry must be MM/YY');
    if (!/^\d{3,4}$/.test(body.card?.cvv || '')) throw new HttpError(402, 'Invalid CVV');
    if (num === '4000000000000002') throw new HttpError(402, 'Card declined by issuing bank (test card)');
    detail = `Card ending ${num.slice(-4)}`; // never store full PAN / CVV
  } else if (method === 'upi') {
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(body.upiId || '')) throw new HttpError(402, 'Enter a valid UPI ID (e.g. name@bank)');
    detail = `UPI ${body.upiId}`;
  } else if (method === 'cod') {
    detail = 'Cash on delivery';
  } else {
    throw new HttpError(400, 'Unsupported payment method');
  }

  // Re-check stock then decrement
  for (const it of order.items) {
    if (it.quantity > state.stock[it.productId]) throw new HttpError(409, `${it.name} just went out of stock`);
  }
  order.items.forEach((it) => (state.stock[it.productId] -= it.quantity));

  const payment = {
    id: 'PAY-' + randomUUID().slice(0, 8).toUpperCase(),
    orderId: order.id,
    method,
    detail,
    amount: order.total,
    status: method === 'cod' ? 'PAY_ON_DELIVERY' : 'SUCCESS',
    paidAt: new Date().toISOString(),
  };
  state.payments.push(payment);
  order.payment = payment;
  order.status = method === 'cod' ? 'PLACED' : 'PAID';
  state.carts[session] = [];
  persist();
  return { status: 201, body: { payment, order } };
});

// ---------- server ----------
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  const url = new URL(req.url, `http://${req.headers.host}`);
  const query = Object.fromEntries(url.searchParams);

  try {
    for (const r of routes) {
      if (r.method !== req.method) continue;
      const m = url.pathname.match(r.regex);
      if (!m) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readBody(req) : {};
      const out = await r.handler({ req, query, params, body, session: sessionOf(req) });
      return send(res, out.status, out.body);
    }
    throw new HttpError(404, `No route for ${req.method} ${url.pathname}`);
  } catch (err) {
    const status = err.status || 500;
    if (status === 500) console.error(err);
    send(res, status, { error: err.message || 'Server error' });
  }
});

server.listen(PORT, () => console.log(`ShopWave API running on http://localhost:${PORT}`));
