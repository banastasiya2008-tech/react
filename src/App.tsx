import React, { useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GameGrid } from "./components/GameGrid";
import { GameForm } from "./components/GameForm";
import { GameDetail } from "./components/GameDetail";
import CartPage from "./components/CartPage";
import { Toast } from "./components/Toast";
import { Overlay } from "./components/Overlay";
import { useFilters } from "./hooks/useFilters";
import { useAuthStore } from "./store/useAuthStore";
import { useCartStore } from "./store/useCartStore";
import { useGamesStore } from "./store/useGamesStore";
import { useToastStore } from "./store/useToastStore";
import { useUiStore } from "./store/useUiStore";
import { initAuth } from "./store/initAuth";
import type { GameFormData } from "./types";

export const App: React.FC = () => {
  const allGames = useGamesStore((s) => s.allGames);
  const loading = useGamesStore((s) => s.loading);
  const loadGames = useGamesStore((s) => s.loadGames);
  const addGame = useGamesStore((s) => s.addGame);
  const updateGame = useGamesStore((s) => s.updateGame);
  const deleteGame = useGamesStore((s) => s.deleteGame);

  const toastMessage = useToastStore((s) => s.message);
  const toastIsError = useToastStore((s) => s.isError);
  const toastVisible = useToastStore((s) => s.visible);
  const showToast = useToastStore((s) => s.showToast);
  const showError = useToastStore((s) => s.showError);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const view = useUiStore((s) => s.view);
  const activeOverlay = useUiStore((s) => s.activeOverlay);
  const selectedGame = useUiStore((s) => s.selectedGame);
  const editingGame = useUiStore((s) => s.editingGame);
  const { openCart, openDetail, backToCatalog, openCreate, openEdit, closeOverlay } =
    useUiStore.getState();

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

  useEffect(() => {
    initAuth();
    loadGames();
  }, [loadGames]);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated, fetchCart]);

  const handleOpenEdit = useCallback(
    (id: number) => {
      const game = allGames.find((g) => g.id === id);
      if (game) openEdit(game);
    },
    [allGames, openEdit]
  );

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
        closeOverlay();
      } catch (err: any) {
        showError(err.message || "Failed to save game");
      }
    },
    [editingGame, addGame, updateGame, showToast, showError, closeOverlay]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await deleteGame(id);
        showToast("Game deleted successfully");
        closeOverlay();
        backToCatalog();
      } catch (err: any) {
        showError(err.message || "Failed to delete game");
      }
    },
    [deleteGame, showToast, showError, closeOverlay, backToCatalog]
  );

  return (
    <div className="app">
      <Header
        query={filters.query}
        onQueryChange={setQuery}
        totalCount={filteredGames.length}
        onAddClick={openCreate}
        onCartClick={openCart}
      />

      {view === "cart" && <CartPage onBack={backToCatalog} />}

      {view === "detail" && selectedGame && (
        <GameDetail
          game={selectedGame}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
          onBack={backToCatalog}
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
                if (game) openDetail(game);
              }}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <Overlay isOpen={activeOverlay === "form"} onClose={closeOverlay}>
        <GameForm game={editingGame} onSave={handleSave} onCancel={closeOverlay} />
      </Overlay>

      <Toast message={toastMessage} isError={toastIsError} visible={toastVisible} />
    </div>
  );
};

export default App;