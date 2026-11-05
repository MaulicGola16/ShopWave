import { Link } from 'react-router-dom';
import { inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';

export function ProductImage({ product, large = false }) {
  const [a, b] = product.gradient;
  return (
    <div
      className={`product-img ${large ? 'large' : ''}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
      aria-label={product.name}
      role="img"
    >
      <span>{product.emoji}</span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const off = Math.round((1 - product.price / product.mrp) * 100);
  const soldOut = product.stock < 1;

  return (
    <article className="card">
      <Link to={`/product/${product.id}`} className="card-media">
        <ProductImage product={product} />
        {off > 0 && <span className="off">{off}% OFF</span>}
      </Link>
      <div className="card-body">
        <div className="brand">{product.brand}</div>
        <Link to={`/product/${product.id}`} className="card-title">{product.name}</Link>
        <div className="rating">★ {product.rating}</div>
        <div className="price-row">
          <strong>{inr(product.price)}</strong>
          <s>{inr(product.mrp)}</s>
        </div>
        <button className="btn small" disabled={soldOut} onClick={() => addToCart(product.id)}>
          {soldOut ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
