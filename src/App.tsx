import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GameGrid } from "./components/GameGrid";
import { GameForm } from "./components/GameForm";
import { GameDetail } from "./components/GameDetail";
import { Toast } from "./components/Toast";
import { Overlay } from "./components/Overlay";
import { useGames } from "./hooks/useGames";
import { useFilters } from "./hooks/useFilters";
import { useToast } from "./hooks/useToast";
import type { Game, GameFormData } from "./types";

type ViewMode = "grid" | "list";
type OverlayName = "form" | "detail";

export const App: React.FC = () => {
  const { allGames, loading, loadGames, addGame, updateGame, deleteGame, getGameById } =
    useGames();
  const {
    filters,
    setQuery,
    setGenre,
    setMinScore,
    setSort,
    resetFilters,
    filteredGames,
    genres,
    genreCounts,
  } = useFilters(allGames);
  const { toast, showToast, showError } = useToast();

  const [view, setView] = useState<ViewMode>("grid");
  const [activeOverlay, setActiveOverlay] = useState<OverlayName | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // Close overlays on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveOverlay(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAddClick = useCallback(() => {
    setEditingGame(null);
    setSelectedGame(null);
    setActiveOverlay("form");
  }, []);

  const handleOpenDetail = useCallback(
    async (id: number) => {
      const game = await getGameById(id);
      if (game) {
        setSelectedGame(game);
        setActiveOverlay("detail");
      }
    },
    [getGameById]
  );

  const handleOpenEdit = useCallback(
    async (id: number) => {
      const game = await getGameById(id);
      if (game) {
        setEditingGame(game);
        setActiveOverlay("form");
      }
    },
    [getGameById]
  );

  const handleSave = useCallback(
    async (data: GameFormData) => {
      try {
        if (editingGame) {
          await updateGame(editingGame.id, data);
          showToast("Game updated ✓");
        } else {
          await addGame(data);
          showToast("Game added ✓");
        }
        setActiveOverlay(null);
        setEditingGame(null);
      } catch (e) {
        showError("Failed to save game.");
        console.error(e);
      }
    },
    [editingGame, updateGame, addGame, showToast, showError]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!confirm("Delete this game?")) return;
      try {
        await deleteGame(id);
        showToast("Game deleted ✓");
        setActiveOverlay(null);
        setSelectedGame(null);
      } catch (e) {
        showError("Failed to delete game.");
        console.error(e);
      }
    },
    [deleteGame, showToast, showError]
  );

  if (loading) {
    return (
      <div className="app">
        <div style={{ padding: 40, textAlign: "center" }}>
          <span className="empty-icon">LOADING</span>
          <h3>Loading games...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        query={filters.query}
        onQueryChange={setQuery}
        totalCount={allGames.length}
        onAddClick={handleAddClick}
      />

      <div className="main">
        <Sidebar
          genres={genres}
          genreCounts={genreCounts}
          activeGenre={filters.genre}
          sort={filters.sort}
          minScore={filters.minScore}
          onGenreChange={setGenre}
          onSortChange={setSort}
          onMinScoreChange={setMinScore}
          onReset={resetFilters}
        />

        <main className="content">
          <div className="content-header">
            <span className="shown">
              Shown: <span>{filteredGames.length}</span>
            </span>
            <div className="view-toggle">
              <button
                className={`view-btn ${view === "grid" ? "on" : ""}`}
                onClick={() => setView("grid")}
              >
                Grid
              </button>
              <button
                className={`view-btn ${view === "list" ? "on" : ""}`}
                onClick={() => setView("list")}
              >
                List
              </button>
            </div>
          </div>
          <GameGrid
            games={filteredGames}
            view={view}
            onOpen={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
          />
        </main>
      </div>

      <Overlay
        isOpen={activeOverlay === "form"}
        onClose={() => setActiveOverlay(null)}
      >
        <GameForm
          game={editingGame}
          onSave={handleSave}
          onCancel={() => setActiveOverlay(null)}
        />
      </Overlay>

      <Overlay
        isOpen={activeOverlay === "detail"}
        onClose={() => setActiveOverlay(null)}
        className="detail-content"
      >
        {selectedGame && (
          <GameDetail
            game={selectedGame}
            onEdit={(id) => {
              setActiveOverlay(null);
              handleOpenEdit(id);
            }}
            onDelete={handleDelete}
            onClose={() => setActiveOverlay(null)}
          />
        )}
      </Overlay>

      <Toast message={toast.message} isError={toast.isError} visible={toast.visible} />
    </div>
  );
};
