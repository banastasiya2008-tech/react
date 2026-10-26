import React from "react";
import type { Game } from "../types";
import { GameCard } from "./GameCard";

interface GameGridProps {
  games: Game[];
  loading?: boolean;
  onOpen: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

export const GameGrid = React.memo(function GameGrid({
  games,
  loading,
  onOpen,
  onEdit,
  onDelete,
}: GameGridProps) {
  if (loading) {
    return (
      <div className="grid">
        <div className="empty">
          <div className="empty-icon">Loading...</div>
          <h3>Loading...</h3>
        </div>
      </div>
    );
  }

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
    <div className="grid">
      {games.map((g) => (
        <GameCard
          key={g.id}
          game={g}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
});