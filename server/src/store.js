// Tiny persistence layer: in-memory state mirrored to server/data/db.json.
// Good enough for a demo; swap for PostgreSQL/MongoDB in production.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from './data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

const state = {
  // stock levels keyed by product id (so seed data stays untouched)
  stock: Object.fromEntries(products.map((x) => [x.id, x.stock])),
  carts: {}, // sessionId -> [{ productId, quantity }]
  orders: [], // order objects
  payments: [], // payment records (never contains full card numbers)
};

try {
  if (fs.existsSync(DB_FILE)) {
    const saved = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    Object.assign(state, saved, { stock: { ...state.stock, ...(saved.stock || {}) } });
  }
} catch (err) {
  console.warn('Could not read db.json, starting fresh:', err.message);
}

export function persist() {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.warn('Could not write db.json:', err.message);
  }
}

export default state;
