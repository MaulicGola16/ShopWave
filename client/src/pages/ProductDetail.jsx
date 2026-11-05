import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, inr } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import ProductCard, { ProductImage } from '../components/ProductCard.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    setProduct(null);
    setQty(1);
    setError('');
    window.scrollTo(0, 0);
    api.product(id).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <div className="container empty"><h2>{error}</h2><Link className="btn" to="/shop">Back to shop</Link></div>;
  if (!product) return <div className="container page muted">Loading…</div>;

  const off = Math.round((1 - product.price / product.mrp) * 100);
  const soldOut = product.stock < 1;

  return (
    <div className="container page">
      <div className="crumbs">
        <Link to="/">Home</Link> / <Link to={`/shop?category=${product.category}`}>{product.category}</Link> / {product.name}
      </div>

      <div className="detail">
        <ProductImage product={product} large />
        <div>
          <div className="brand">{product.brand}</div>
          <h1>{product.name}</h1>
          <div className="rating">★ {product.rating} <span className="muted">· {product.stock} in stock</span></div>
          <div className="price-row big">
            <strong>{inr(product.price)}</strong>
            <s>{inr(product.mrp)}</s>
            <span className="off-text">{off}% off</span>
          </div>
          <p className="desc">{product.description}</p>

          <div className="qty-row">
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} aria-label="Increase">+</button>
            </div>
            <button className="btn" disabled={soldOut} onClick={() => addToCart(product.id, qty)}>
              {soldOut ? 'Out of stock' : 'Add to cart'}
            </button>
            <button
              className="btn ghost dark"
              disabled={soldOut}
              onClick={async () => (await addToCart(product.id, qty)) && navigate('/cart')}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      {product.related?.length > 0 && (
        <section className="section">
          <h2>You may also like</h2>
          <div className="grid">{product.related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
