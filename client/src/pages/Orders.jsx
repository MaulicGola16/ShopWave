import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api, inr } from '../api.js';

const STATUS = {
  PAID: ['Paid', 'ok'],
  PLACED: ['Placed · Pay on delivery', 'ok'],
  PENDING_PAYMENT: ['Awaiting payment', 'warn'],
};

export default function Orders() {
  const { state } = useLocation();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.orders().then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="container page"><div className="alert">{error}</div></div>;
  if (!orders) return <div className="container page muted">Loading orders…</div>;

  return (
    <div className="container page">
      {state?.placed && (
        <div className="success">🎉 Thank you! Order <b>{state.placed}</b> has been placed.</div>
      )}
      <h1>My orders</h1>

      {orders.length === 0 && (
        <div className="empty">
          <div className="big-emoji">📦</div>
          <h3>No orders yet</h3>
          <Link className="btn" to="/shop">Start shopping</Link>
        </div>
      )}

      {orders.map((o) => {
        const [label, tone] = STATUS[o.status] || [o.status, 'warn'];
        return (
          <article className="order" key={o.id}>
            <header>
              <div>
                <b>{o.id}</b>
                <div className="muted small-text">{new Date(o.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <span className={`status ${tone}`}>{label}</span>
            </header>
            <ul>
              {o.items.map((it) => (
                <li key={it.productId}>
                  <span>{it.emoji} {it.name} × {it.quantity}</span>
                  <span>{inr(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <footer>
              <span className="muted small-text">
                Ship to {o.customer.name}, {o.customer.address}, {o.customer.city} {o.customer.pincode}
                {o.payment && <> · {o.payment.detail}</>}
              </span>
              <b>Total {inr(o.total)}</b>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
