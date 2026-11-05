import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const TABS = [
  { id: '', label: 'All' },
  { id: 'clothes', label: '👕 Clothes' },
  { id: 'watches', label: '⌚ Watches' },
  { id: 'shoes', label: '👟 Shoes' },
];

export default function Catalogue() {
  const [params, setParams] = useSearchParams();
  const category = params.get('category') || '';
  const search = params.get('search') || '';
  const sort = params.get('sort') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .products({ category, search, sort })
      .then((p) => {
        setProducts(p);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, search, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="container page">
      <h1>{search ? `Results for “${search}”` : 'Shop'}</h1>

      <div className="toolbar">
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`tab ${category === t.id ? 'active' : ''}`}
              onClick={() => update('category', t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <label className="sort">
          Sort by
          <select value={sort} onChange={(e) => update('sort', e.target.value)}>
            <option value="">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading && <p className="muted">Loading products…</p>}
      {!loading && !error && products.length === 0 && (
        <div className="empty"><h3>No products found</h3><p>Try a different search or category.</p></div>
      )}

      <div className="grid">
        {products.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
