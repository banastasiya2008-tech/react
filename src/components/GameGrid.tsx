import React from "react";
import type { Game } from "../types";
import { GameCard } from "./GameCard";

interface GameGridProps {
  games: Game[];
  view: "grid" | "list";
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  games,
  view,
  onOpen,
  onEdit,
  onDelete,
}) => {
  if (games.length === 0) {
    return (
      <div className="grid">
        <div className="empty">
          <div className="empty-icon">Nothing found</div>
          <h3>No results</h3>
          <p>Try changing the filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid ${view === "list" ? "list" : ""}`}>
      {games.map((g, i) => (
        <GameCard
          key={g.id}
          game={g}
          index={i}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
