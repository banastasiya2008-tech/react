import React from "react";
import type { SortOption } from "../types";

interface SidebarProps {
  genres: string[];
  genreCounts: Map<string, number>;
  activeGenre: string;
  sort: SortOption;
  minScore: number;
  onGenreChange: (genre: string) => void;
  onSortChange: (sort: SortOption) => void;
  onMinScoreChange: (score: number) => void;
  onReset: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  genres,
  genreCounts,
  activeGenre,
  sort,
  minScore,
  onGenreChange,
  onSortChange,
  onMinScoreChange,
  onReset,
}) => {
  const totalCount = [...genreCounts.values()].reduce((a, b) => a + b, 0);

  return (
    <aside className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">GENRE</h3>
        <div className="pills">
          <button
            className={`genre-pill ${activeGenre === "all" ? "active" : ""}`}
            onClick={() => onGenreChange("all")}
          >
            All <span className="pill-count">{totalCount}</span>
          </button>
          {genres.map((g) => (
            <button
              key={g}
              className={`genre-pill ${activeGenre === g ? "active" : ""}`}
              onClick={() => onGenreChange(g)}
            >
              {g} <span className="pill-count">{genreCounts.get(g) ?? 0}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">SORT</h3>
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
        >
          <option value="score-d">Score ↓</option>
          <option value="score-a">Score ↑</option>
          <option value="name-a">Name A→Z</option>
          <option value="name-z">Name Z→A</option>
          <option value="year-d">Year ↓</option>
          <option value="year-a">Year ↑</option>
        </select>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-title">MIN. RATING</h3>
        <div className="rating-options">
          <label className="radio-label">
            <input
              type="radio"
              name="ms"
              value={0}
              checked={minScore === 0}
              onChange={() => onMinScoreChange(0)}
            />
            <span className="stars">★★★★★</span> Any
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="ms"
              value={8}
              checked={minScore === 8}
              onChange={() => onMinScoreChange(8)}
            />
            <span className="stars">★★★★</span> 8.0+
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="ms"
              value={6}
              checked={minScore === 6}
              onChange={() => onMinScoreChange(6)}
            />
            <span className="stars">★★★</span> 6.0+
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="ms"
              value={4}
              checked={minScore === 4}
              onChange={() => onMinScoreChange(4)}
            />
            <span className="stars">★★</span> 4.0+
          </label>
        </div>
      </div>

      <button className="btn-reset" onClick={onReset}>
        RESET FILTERS
      </button>
    </aside>
  );
};
