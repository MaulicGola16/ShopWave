# 🛍️ ShopWave — E-Commerce App

A full-stack e-commerce app selling **Clothes, Watches and Shoes**, with a dynamic React storefront and a REST API.

| Module     | What it does                                                            |
|------------|-------------------------------------------------------------------------|
| Front end  | Home, Catalogue (filter/search/sort), Product detail, Cart, Checkout, Orders |
| Catalogue  | Product + category API with search, sorting and stock levels            |
| Cart       | Per-session cart with quantity limits based on stock                    |
| Orders     | Creates orders from the cart with validated shipping details            |
| Payments   | **Simulated** Card (Luhn check), UPI and Cash-on-Delivery               |

## Tech stack

- **Frontend:** HTML5, CSS, JavaScript (ES2022), React 19 + Vite, React Router
- **Backend:** Node.js (built-in `http`, **zero dependencies**), JSON-file persistence

## Getting started

Requires Node.js 18+.

```bash
# 1. Backend (http://localhost:5000)
cd server
npm start

# 2. Frontend (http://localhost:5173) — in a second terminal
cd client
npm install
npm run dev
```

Vite proxies `/api/*` to the backend, so no extra config is needed.

## API

| Method | Endpoint                         | Description                                   |
|--------|----------------------------------|-----------------------------------------------|
| GET    | `/api/categories`                | Categories with product counts                |
| GET    | `/api/products`                  | `?category=&search=&sort=&minPrice=&maxPrice=&limit=` |
| GET    | `/api/products/:id`              | Product details + related products            |
| GET    | `/api/cart`                      | Current cart with totals                      |
| POST   | `/api/cart`                      | `{ productId, quantity }` add item            |
| PATCH  | `/api/cart/:productId`           | `{ quantity }` update item                    |
| DELETE | `/api/cart/:productId`           | Remove item                                   |
| POST   | `/api/orders`                    | `{ customer: {name,email,phone,address,city,pincode} }` |
| GET    | `/api/orders` · `/api/orders/:id`| Order history                                 |
| POST   | `/api/payments`                  | `{ orderId, method: card\|upi\|cod, card?, upiId? }` |

The cart and orders are scoped by an `X-Session-Id` header (the client stores a random id in `localStorage`).

## Trying payments

- Card success: `4242 4242 4242 4242`, any future `MM/YY`, any 3-digit CVV
- Card declined: `4000 0000 0000 0002`
- UPI: any ID shaped like `name@bank`
- Cash on delivery: no details needed

> ⚠️ Payments are simulated — no real gateway is called and full card numbers are never stored.
> To go live, integrate Razorpay/Stripe inside `POST /api/payments` and add real authentication.

## Project structure

```
ecommerce-app/
├── server/            # Node REST API
│   └── src/ (index.js, store.js, data/products.js)
└── client/            # React + Vite
    └── src/ (pages/, components/, context/CartContext.jsx, api.js, styles.css)
```

## Roadmap ideas

User accounts (JWT), a real database (PostgreSQL/MongoDB), real product images, reviews, admin panel, order tracking.
