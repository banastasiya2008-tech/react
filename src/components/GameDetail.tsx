import React, { useState } from 'react';
import type { Game } from '../types';
import { useAuthStore, useIsAdmin, useIsModerator } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { rateGame } from '../api/api';
import { useToastStore } from '../store/useToastStore';

interface GameDetailProps {
  game: Game;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
}

function scoreColor(score: number): string {
  if (score >= 9) return '#4caf50';
  if (score >= 7) return '#ff9800';
  return '#f44336';
}

export const GameDetail: React.FC<GameDetailProps> = ({ game, onEdit, onDelete, onBack }) => {
  const [imgError, setImgError] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [avgRating, setAvgRating] = useState<number>(Number(game.score) || 0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const hasValidCover = game.cover && game.cover.startsWith('http') && !imgError;
  const isAdmin = useIsAdmin();
  const isModerator = useIsModerator();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const inCartStore = useCartStore((s) => s.items);
  const isInCart = (id: number) => inCartStore.some((i) => i.id === id);
  const showToast = useToastStore((s) => s.showToast);
  const showError = useToastStore((s) => s.showError);
  const inCart = isInCart(game.id);

  const handleRate = async (rating: number) => {
    try {
      const result = await rateGame(game.id, rating);
      setUserRating(rating);
      setAvgRating(result.average);
      setRatingCount(result.count);
      showToast(`Rated ${rating}/10! Average: ${result.average.toFixed(1)}`);
    } catch (err: any) {
      showError(err.message || 'Failed to rate');
    }
  };

  const handleAddToCart = async () => {
    try {
      await addItem(game.id);
      showToast(`${game.name} added to cart`);
    } catch (err: any) {
      showError(err.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="game-detail-page">
      <button className="btn-ghost cart-back-btn game-detail-back" onClick={onBack}>
        &larr; Back to catalog
      </button>

      <div className="game-detail">
        <div className="game-detail-cover">
          {hasValidCover ? (
            <img
              src={game.cover}
              alt={game.name}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="game-detail-cover-placeholder">No Cover</div>
          )}
        </div>

        <div className="game-detail-info">
          <h2>{game.name}</h2>

          <div className="game-detail-score" style={{ color: scoreColor(avgRating) }}>
            {avgRating.toFixed(1)} / 10
            {ratingCount > 0 && (
              <span className="game-detail-rating-count"> ({ratingCount} ratings)</span>
            )}
          </div>

          {game.desc && (
            <p className="game-detail-description">{game.desc}</p>
          )}

          {isAuthenticated && (
            <div className="game-detail-rate">
              <span>Your rating:</span>
              <div className="game-detail-stars">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
                  <span
                    key={star}
                    className="game-detail-star"
                    style={{
                      color: (hoverRating || userRating) >= star ? '#ff9800' : '#ccc',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleRate(star)}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="game-detail-actions">
            <button
              className="game-detail-cart-btn"
              onClick={handleAddToCart}
              disabled={inCart}
            >
              {inCart ? 'In Cart' : 'Add to Cart'}
            </button>

            {(isAdmin || isModerator) && (
              <button className="game-detail-edit-btn" onClick={() => onEdit(game.id)}>
                Edit
              </button>
            )}

            {isAdmin && (
              <button className="game-detail-delete-btn" onClick={() => onDelete(game.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}