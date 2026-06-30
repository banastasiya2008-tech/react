import React from "react";
import type { Game } from "../types";

interface GameDetailProps {
  game: Game;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

const scoreColor = (s: number): string => {
  if (s >= 8) return "var(--green)";
  if (s >= 6) return "var(--amber-dim)";
  return "var(--red)";
};

export const GameDetail: React.FC<GameDetailProps> = ({
  game,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <div>
      <div className="det-art-wrap">
        {game.cover ? (
          <img
            className="det-art"
            src={game.cover}
            alt={game.name}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
              const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
              if (next) next.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="det-art-ph"
          style={{ display: game.cover ? "none" : "flex" }}
        >
          <span className="art-ph-text">{game.name}</span>
        </div>
      </div>
      <div className="det-info">
        <div className="det-title">{game.name}</div>
        <div className="det-chips">
          {game.genre ? <span className="chip chip-genre">{game.genre}</span> : null}
          {game.year ? <span className="chip chip-year">{game.year}</span> : null}
          {game.plat.map((p) => (
            <span key={p} className="chip chip-plat">
              {p}
            </span>
          ))}
          {game.tags.map((t) => (
            <span key={t} className="chip chip-tag">
              {t}
            </span>
          ))}
        </div>
        <div className="det-score-row">
          <span className="det-score-num" style={{ color: scoreColor(game.score) }}>
            {game.score.toFixed(1)}
          </span>
          <span className="det-score-denom">/ 10</span>
        </div>
      </div>
      <div className="det-body">
        <div>
          <div className="det-label">Description</div>
          <div className="det-text">{game.desc || "No description available"}</div>
        </div>
        <div>
          <div className="det-label">Developer</div>
          <div className="det-text">{game.dev || "Unknown"}</div>
        </div>
        <div>
          <div className="det-label">Publisher</div>
          <div className="det-text">{game.pub || "Unknown"}</div>
        </div>
      </div>
      <div className="det-actions">
        <button className="btn-edit-det" onClick={() => onEdit(game.id)}>
          Change
        </button>
        <button className="btn-del-det" onClick={() => onDelete(game.id)}>
          Delete
        </button>
        <button className="btn-ghost" style={{ marginLeft: "auto" }} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};
