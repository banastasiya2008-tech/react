import { useEffect, useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { clearCart } from '../api/api';
import { getCoverImage } from '../api/api';
import { useToast } from '../hooks/useToast';
import type { ApiGame } from '../types';

interface CartPageProps {
  onBack: () => void;
}

function CartItemImg({ game }: { game: ApiGame }) {
  const [broken, setBroken] = useState(false);
  const src = broken ? getCoverImage(undefined, game.title) : getCoverImage(game.coverImage, game.title);
  return (
    <img
      src={src}
      alt={game.title}
      className="cart-item-img"
      onError={() => setBroken(true)}
    />
  );
}

export default function CartPage({ onBack }: CartPageProps) {
  const { items, fetchCart, removeItem } = useCartStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleClear = async () => {
    await clearCart();
    await fetchCart();
    showToast('Cart cleared');
  };

  const total = items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);

  return (
    <div className="cart-page">
      <div className="cart-page-header">
        <button className="btn-ghost cart-back-btn" onClick={onBack}>
          &larr; Back to catalog
        </button>
        <h2>Your Cart ({items.length})</h2>
      </div>

      {items.length === 0 ? (
        <div className="cart-empty">
          Your cart is empty.
          <button className="btn-primary" onClick={onBack}>Browse games</button>
        </div>
      ) : (
        <>
          <div className="cart-list">
            {items.map((game) => (
              <div key={game.id} className="cart-item">
                <CartItemImg game={game} />
                <div className="cart-item-info">
                  <div className="cart-item-title">{game.title}</div>
                  <div className="cart-item-meta">{game.genre} · ${(Number(game.price) || 0).toFixed(2)}</div>
                </div>
                <button
                  className="ico-btn ico-del"
                  onClick={() => removeItem(game.id)}
                >
                  Del
                </button>
              </div>
            ))}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span>Total</span>
              <span className="cart-total-price">${total.toFixed(2)}</span>
            </div>
            <div className="cart-actions">
              <button className="btn-ghost" onClick={handleClear}>Clear</button>
              <button className="btn-primary" onClick={() => showToast('Checkout coming soon!')}>
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}