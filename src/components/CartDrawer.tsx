import { useEffect } from 'react';
import { useCartStore } from '../store/useCartStore';
import { clearCart } from '../api/api';
import { getCoverImage } from '../api/api';
import { useToast } from '../hooks/useToast';

interface CartDrawerProps {
  onClose: () => void;
}

export default function CartDrawer({ onClose }: CartDrawerProps) {
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
    <div className="cart-overlay open" onClick={onClose}>
      <div className="cart-panel" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart ({items.length})</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="cart-body">
          {items.length === 0 ? (
            <div className="cart-empty">Your cart is empty</div>
          ) : (
            items.map((game) => (
              <div key={game.id} className="cart-item">
                <img 
                  src={getCoverImage(game.coverImage, game.title)} 
                  alt={game.title}
                  className="cart-item-img"
                />
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
            ))
          )}
        </div>

        {items.length > 0 && (
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
        )}
      </div>
    </div>
  );
}