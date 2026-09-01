import React, { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GameGrid } from "./components/GameGrid";
import { GameForm } from "./components/GameForm";
import { GameDetail } from "./components/GameDetail";
import CartPage from "./components/CartPage";
import { Toast } from "./components/Toast";
import { Overlay } from "./components/Overlay";
import { useGames } from "./hooks/useGames";
import { useFilters } from "./hooks/useFilters";
import { useToast } from "./hooks/useToast";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";
import type { Game, GameFormData } from "./types";

type OverlayName = "form";
type ViewName = "catalog" | "cart" | "detail";

export const App: React.FC = () => {
  useEffect(() => {
    const init = async () => {
      const token = useAuthStore.getState().token;
      if (!token) {
        try {
          const res = await fetch('http://localhost:5003/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          });
          if (res.ok) {
            const data = await res.json();
            useAuthStore.getState().login(data.user, data.accessToken);
          }
        } catch {
          // нет валидной сессии
        }
      }
    };
    init();
  }, []);

  const { allGames, loading, addGame, updateGame, deleteGame } = useGames();
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
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchCart = useCartStore((state) => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const [view, setView] = useState<ViewName>("catalog");
  const [activeOverlay, setActiveOverlay] = useState<OverlayName | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const handleOpenDetail = useCallback((game: Game) => {
    setSelectedGame(game);
    setView("detail");
  }, []);

  const handleOpenEdit = useCallback((id: number) => {
    const game = allGames.find((g) => g.id === id);
    if (game) {
      setEditingGame(game);
      setActiveOverlay("form");
    }
  }, [allGames]);

  const handleOpenCreate = useCallback(() => {
    setEditingGame(null);
    setActiveOverlay("form");
  }, []);

  const handleSave = useCallback(
    async (data: GameFormData) => {
      try {
        if (editingGame) {
          await updateGame(editingGame.id, data);
          showToast("Game updated successfully");
        } else {
          await addGame(data);
          showToast("Game created successfully");
        }
        setActiveOverlay(null);
        setEditingGame(null);
      } catch (err: any) {
        showError(err.message || "Failed to save game");
      }
    },
    [editingGame, addGame, updateGame, showToast, showError]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteGame(id);
        showToast("Game deleted successfully");
        setActiveOverlay(null);
        setSelectedGame(null);
        setView("catalog");
      } catch (err: any) {
        showError(err.message || "Failed to delete game");
      }
    },
    [deleteGame, showToast, showError]
  );

  return (
    <div className="app">
      <Header
        query={filters.query}
        onQueryChange={setQuery}
        totalCount={filteredGames.length}
        onAddClick={handleOpenCreate}
        onCartClick={() => setView("cart")}
      />

      {view === "cart" && <CartPage onBack={() => setView("catalog")} />}

      {view === "detail" && selectedGame && (
        <GameDetail
          game={selectedGame}
          onEdit={(id) => {
            setView("catalog");
            handleOpenEdit(id);
          }}
          onDelete={handleDelete}
          onBack={() => {
            setView("catalog");
            setSelectedGame(null);
          }}
        />
      )}

      {view === "catalog" && (
        <div className="main">
          <Sidebar
            genres={genres}
            genreCounts={genreCounts}
            activeGenre={filters.genre}
            onGenreChange={setGenre}
            minScore={filters.minScore}
            onMinScoreChange={setMinScore}
            sort={filters.sort}
            onSortChange={setSort}
            onReset={resetFilters}
          />

          <div className="content">
            <div className="toolbar">
              <span className="count">{filteredGames.length} games</span>
            </div>

            <GameGrid
              games={filteredGames}
              loading={loading}
              onOpen={(id: number) => {
                const game = allGames.find((g) => g.id === id);
                if (game) handleOpenDetail(game);
              }}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

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

      <Toast message={toast.message} isError={toast.isError} visible={toast.visible} />
    </div>
  );
};

export default App;