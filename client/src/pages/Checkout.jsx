import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { Summary } from './Cart.jsx';

const EMPTY_ADDR = { name: '', email: '', phone: '', address: '', city: '', pincode: '' };

export default function Checkout() {
  const { cart, refresh, notify } = useCart();
  const navigate = useNavigate();
  const [addr, setAddr] = useState(EMPTY_ADDR);
  const [method, setMethod] = useState('card');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '' });
  const [upiId, setUpiId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (cart.items.length === 0) {
    return (
      <div className="container empty">
        <h2>Nothing to check out</h2>
        <Link className="btn" to="/shop">Browse products</Link>
      </div>
    );
  }

  const setA = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = await api.createOrder(addr); // 1) create order from cart
      await api.pay({ orderId: order.id, method, card, upiId }); // 2) take payment
      await refresh(); // cart is cleared server-side
      notify('Order placed successfully 🎉');
      navigate('/orders', { state: { placed: order.id } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <form className="cart-layout" onSubmit={submit}>
        <div>
          <fieldset className="panel">
            <legend>1. Shipping details</legend>
            <div className="form-grid">
              <input required placeholder="Full name" value={addr.name} onChange={setA('name')} />
              <input required type="email" placeholder="Email" value={addr.email} onChange={setA('email')} />
              <input required placeholder="Phone" value={addr.phone} onChange={setA('phone')} />
              <input required placeholder="City" value={addr.city} onChange={setA('city')} />
              <input required className="span2" placeholder="Address" value={addr.address} onChange={setA('address')} />
              <input required placeholder="Pincode (6 digits)" maxLength={6} value={addr.pincode} onChange={setA('pincode')} />
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>2. Payment</legend>
            <div className="methods">
              {[
                ['card', '💳 Card'],
                ['upi', '📱 UPI'],
                ['cod', '💵 Cash on delivery'],
              ].map(([id, label]) => (
                <label key={id} className={`method ${method === id ? 'active' : ''}`}>
                  <input type="radio" name="method" checked={method === id} onChange={() => setMethod(id)} />
                  {label}
                </label>
              ))}
            </div>

            {method === 'card' && (
              <div className="form-grid">
                <input required className="span2" inputMode="numeric" placeholder="Card number (try 4242 4242 4242 4242)" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                <input required placeholder="MM/YY" maxLength={5} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                <input required placeholder="CVV" maxLength={4} type="password" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} />
              </div>
            )}
            {method === 'upi' && (
              <div className="form-grid">
                <input required className="span2" placeholder="UPI ID (e.g. name@okbank)" value={upiId} onChange={(e) => setUpiId(e.target.value)} />
              </div>
            )}
            {method === 'cod' && <p className="muted">Pay in cash when your order arrives.</p>}
            <p className="muted small-text">🔒 Demo store: payments are simulated and no real charge is made.</p>
          </fieldset>
        </div>

        <div>
          <Summary cart={cart} />
          {error && <div className="alert">{error}</div>}
          <button className="btn block" disabled={busy}>
            {busy ? 'Processing…' : method === 'cod' ? 'Place order' : `Pay ${inr(cart.total)}`}
          </button>
        </div>
      </form>
    </div>
  );
}
