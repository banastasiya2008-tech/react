import { useState } from 'react';
import AuthModal from './AuthModal';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { logout as apiLogout } from '../api/api';

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalCount: number;
  onAddClick: () => void;
  onCartClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  query, 
  onQueryChange, 
  totalCount, 
  onAddClick,
  onCartClick,
}) => {
  const [showAuth, setShowAuth] = useState(false);
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();
  const { getCount } = useCartStore();
  const cartCount = getCount();

  const handleLogout = async () => {
    try { await apiLogout(); } catch {}
    storeLogout();
  };

  return (
    <>
      <header className="header">
        <div className="logo">
          <span className="logo-main">VAULT</span>
          <span className="logo-sub">Game bibliotek</span>
        </div>
        <div className="search-wrap">
          <input
            type="text"
            placeholder="Search by title, developer, tag..."
            className="search-input"
            value={query}
            onChange={(e) => onQueryChange(e.target.value.toLowerCase())}
          />
        </div>
        <div className="header-actions">
          <span className="tally">{totalCount} games</span>
          
          {isAuthenticated && (
            <button className="btn-auth cart-btn" onClick={onCartClick}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}

          {isAuthenticated ? (
            <>
              <span className="user-pill">
                {user?.username} ({user?.role})
              </span>
              <button className="btn-auth" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button className="btn-auth" onClick={() => setShowAuth(true)}>
              Login
            </button>
          )}
          <button className="btn-primary" onClick={onAddClick}>
            Add Game
          </button>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}