import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <div className="logo">🛍️ Shop<span>Wave</span></div>
          <p>Clothes, watches and shoes — delivered to your door.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop?category=clothes">Clothes</Link>
          <Link to="/shop?category=watches">Watches</Link>
          <Link to="/shop?category=shoes">Shoes</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/cart">Cart</Link>
          <Link to="/orders">My orders</Link>
        </div>
      </div>
      <div className="copy">© {new Date().getFullYear()} ShopWave · Demo store — payments are simulated</div>
    </footer>
  );
}
