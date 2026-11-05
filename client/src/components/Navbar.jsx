import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    navigate(`/shop?search=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo">🛍️ Shop<span>Wave</span></Link>

        <nav className="nav-links">
          <NavLink to="/shop?category=clothes">Clothes</NavLink>
          <NavLink to="/shop?category=watches">Watches</NavLink>
          <NavLink to="/shop?category=shoes">Shoes</NavLink>
        </nav>

        <form className="search" onSubmit={onSearch} role="search">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            aria-label="Search products"
          />
          <button type="submit" aria-label="Search">🔍</button>
        </form>

        <div className="nav-actions">
          <Link to="/orders">Orders</Link>
          <Link to="/cart" className="cart-link">
            🛒 Cart
            {cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}
          </Link>
        </div>
      </div>
    </header>
  );
}
