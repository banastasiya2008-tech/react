import React, { useState } from 'react';
import type { Game } from '../types';
import { useAuthStore, useIsAdmin, useIsModerator } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useToastStore } from '../store/useToastStore';

interface GameCardProps {
  game: Game;
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

function scoreClass(score: number): string {
  if (score >= 9) return 'score-high';
  if (score >= 7) return 'score-mid';
  return 'score-low';
}

export const GameCard = React.memo(function GameCard({ game, onEdit, onDelete, onOpen }: GameCardProps) {
  const [imgError, setImgError] = useState(false);
  const plats = game.plat?.join(', ') || '-';
  const isAdmin = useIsAdmin();
  const isModerator = useIsModerator();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items.some((i) => i.id === game.id));
  const showToast = useToastStore((s) => s.showToast);
  const showError = useToastStore((s) => s.showError);

  const hasValidCover = game.cover && game.cover.startsWith('http') && !imgError;
  const price = Number(game.price) || 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await addItem(game.id);
      showToast('Added to cart!');
    } catch (err: any) {
      showError(err.message || 'Failed to add');
    }
  };

  return (
    <div className="card" onClick={() => onOpen(game.id)}>
      {hasValidCover ? (
        <img 
          src={game.cover} 
          alt={game.name} 
          className="card-art" 
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="card-art-ph">
          <span className="art-ph-text">{game.name}</span>
        </div>
      )}
      <span className="card-genre-tag">{game.genre || "-"}</span>
      <div className="card-body">
        <div className="card-name">{game.name}</div>
        <div className="card-row">
          <span className="card-dev">
            {game.dev || "Unknown"}
            {game.year ? " · " + game.year : ""}
          </span>
          <span className={`card-score ${scoreClass(game.score)}`}>
            {typeof game.score === 'number' ? game.score.toFixed(1) : 'N/A'}
          </span>
        </div>
        <div className="card-desc">
          {game.desc || "No description available."}
        </div>
        <div className="card-price">
          {price > 0 ? `$${price.toFixed(2)}` : 'Free'}
        </div>
      </div>
      <div className="card-foot">
        <span className="card-plat">{plats}</span>
        <div className="card-btns">
          {isAuthenticated && !inCart && (
            <button className="ico-btn cart-add" onClick={handleAddToCart} title="Add to cart">
              Buy
            </button>
          )}
          {isAuthenticated && inCart && (
            <button className="ico-btn cart-in" disabled title="In cart">
              In Cart
            </button>
          )}
          {(isAdmin || isModerator) && (
            <>
              <button className="ico-btn ico-edit" onClick={(e) => { e.stopPropagation(); onEdit(game.id); }}>
                Edit
              </button>
              {isAdmin && (
                <button className="ico-btn ico-del" onClick={(e) => { e.stopPropagation(); onDelete(game.id); }}>
                  Del
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});