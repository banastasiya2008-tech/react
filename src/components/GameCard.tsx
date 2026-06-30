import React from "react";
import type { GameCardData } from "../types";

interface GameCardProps {
  game: GameCardData;
  index: number;
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const scoreClass = (s: number): string => {
  if (s >= 8) return "score-high";
  if (s >= 6) return "score-mid";
  return "score-low";
};

export const GameCard: React.FC<GameCardProps> = ({
  game,
  index,
  onOpen,
  onEdit,
  onDelete,
}) => {
  const plats =
    game.plat.slice(0, 3).join(" · ") +
    (game.plat.length > 3 ? ` +${game.plat.length - 3}` : "");

  return (
    <div
      className="card"
      style={{ animationDelay: `${index * 0.035}s` }}
      onClick={() => onOpen(game.id)}
    >
      <div style={{ position: "relative" }}>
        {game.cover ? (
          <img
           className="card-art"
           src={game.cover || `https://placehold.co/300x400/1a1510/c9842b?text=${encodeURIComponent(game.name)}`}
           alt={game.name}
          />
        ) : null}
        <div
          className="card-art-ph"
          style={{ display: game.cover ? "none" : "flex" }}
        >
          <span className="art-ph-text">{game.name}</span>
        </div>
        <span className="card-genre-tag">{game.genre || "—"}</span>
      </div>
      <div className="card-body">
        <div className="card-name">{game.name}</div>
        <div className="card-row">
          <span className="card-dev">
            {game.dev || "Unknown"}
            {game.year ? " · " + game.year : ""}
          </span>
          <span className={`card-score ${scoreClass(game.score)}`}>
            {game.score.toFixed(1)}
          </span>
        </div>
        <div className="card-desc">
          {game.desc || "No description available."}
        </div>
      </div>
      <div className="card-foot">
        <span className="card-plat">{plats || "—"}</span>
        <div className="card-btns">
          <button
            className="ico-btn ico-edit"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(game.id);
            }}
          >
            Change
          </button>
          <button
            className="ico-btn ico-del"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(game.id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
