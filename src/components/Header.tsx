import React from "react";

interface HeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  totalCount: number;
  onAddClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ query, onQueryChange, totalCount, onAddClick }) => {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-main">VAULT</span>
        <span className="logo-sub">Game bibliotek</span>
      </div>
      <div className="search-wrap">
        <input
          type="text"
          placeholder="Search by title, developer, tag…"
          className="search-input"
          value={query}
          onChange={(e) => onQueryChange(e.target.value.toLowerCase())}
        />
      </div>
      <div className="header-actions">
        <span className="tally">{totalCount} games</span>
        <button className="btn-primary" onClick={onAddClick}>
          Add Game
        </button>
      </div>
    </header>
  );
};
