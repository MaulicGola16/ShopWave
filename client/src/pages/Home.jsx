import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.categories(), api.products({ sort: 'rating' })])
      .then(([c, p]) => {
        setCategories(c);
        setProducts(p);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="pill">New season · Up to 40% off</span>
            <h1>Dress well. Time it right. Step out in style.</h1>
            <p>Shop the best of clothes, watches and shoes — curated, comfortable and delivered fast.</p>
            <div className="hero-cta">
              <Link to="/shop" className="btn">Shop all</Link>
              <Link to="/shop?category=watches" className="btn ghost">Explore watches</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span>👕</span><span>⌚</span><span>👟</span>
          </div>
        </div>
      </section>

      <div className="container">
        {error && (
          <div className="alert">
            Couldn’t load products: {error}. Is the backend running on port 5000?
          </div>
        )}

        <section className="section">
          <h2>Shop by category</h2>
          <div className="cat-grid">
            {loading && [0, 1, 2].map((i) => <div key={i} className="skeleton cat-tile" />)}
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/shop?category=${c.id}`}
                className="cat-tile"
                style={{ background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})` }}
              >
                <span className="cat-emoji">{c.emoji}</span>
                <div>
                  <h3>{c.name}</h3>
                  <p>{c.tagline}</p>
                  <small>{c.count} products →</small>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {categories.map((c) => {
          const items = products.filter((p) => p.category === c.id).slice(0, 4);
          return (
            <section className="section" key={c.id}>
              <div className="section-head">
                <h2>{c.emoji} Top {c.name}</h2>
                <Link to={`/shop?category=${c.id}`}>View all →</Link>
              </div>
              <div className="grid">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          );
        })}

        <section className="perks">
          <div><span>🚚</span><b>Free delivery</b><small>On orders over ₹999</small></div>
          <div><span>↩️</span><b>Easy returns</b><small>7-day hassle-free returns</small></div>
          <div><span>🔒</span><b>Secure payments</b><small>Card, UPI &amp; COD</small></div>
        </section>
      </div>
    </>
  );
}
