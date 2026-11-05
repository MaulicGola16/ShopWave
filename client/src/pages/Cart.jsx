import { Link } from 'react-router-dom';
import { inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { ProductImage } from '../components/ProductCard.jsx';

export function Summary({ cart }) {
  return (
    <aside className="summary">
      <h3>Order summary</h3>
      <div><span>Subtotal ({cart.itemCount} items)</span><span>{inr(cart.subtotal)}</span></div>
      <div><span>Shipping</span><span>{cart.shipping === 0 ? 'FREE' : inr(cart.shipping)}</span></div>
      <div><span>GST (5%)</span><span>{inr(cart.tax)}</span></div>
      <div className="total"><span>Total</span><span>{inr(cart.total)}</span></div>
    </aside>
  );
}

export default function Cart() {
  const { cart, updateQty, remove } = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="container empty">
        <div className="big-emoji">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add something you love from our collection.</p>
        <Link className="btn" to="/shop">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="container page">
      <h1>Your cart</h1>
      <div className="cart-layout">
        <div className="cart-list">
          {cart.items.map(({ product, quantity }) => (
            <div className="cart-row" key={product.id}>
              <Link to={`/product/${product.id}`}><ProductImage product={product} /></Link>
              <div className="cart-info">
                <Link to={`/product/${product.id}`} className="card-title">{product.name}</Link>
                <div className="brand">{product.brand}</div>
                <strong>{inr(product.price)}</strong>
              </div>
              <div className="qty">
                <button onClick={() => updateQty(product.id, quantity - 1)} disabled={quantity <= 1} aria-label="Decrease">−</button>
                <span>{quantity}</span>
                <button onClick={() => updateQty(product.id, quantity + 1)} disabled={quantity >= product.stock} aria-label="Increase">+</button>
              </div>
              <div className="line-total">{inr(product.price * quantity)}</div>
              <button className="link-btn" onClick={() => remove(product.id)}>Remove</button>
            </div>
          ))}
        </div>
        <div>
          <Summary cart={cart} />
          <Link className="btn block" to="/checkout">Proceed to checkout</Link>
        </div>
      </div>
    </div>
  );
}
