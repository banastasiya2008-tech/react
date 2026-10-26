import React, { Suspense, lazy, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { GameGrid } from "./components/GameGrid";
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

const CartPage = lazy(() => import("./components/CartPage"));
const GameDetail = lazy(() =>
  import("./components/GameDetail").then((m) => ({ default: m.GameDetail }))
);
const GameForm = lazy(() =>
  import("./components/GameForm").then((m) => ({ default: m.GameForm }))
);

const { openCart, openDetail, backToCatalog, openCreate, openEdit, closeOverlay } =
  useUiStore.getState();
const { showToast, showError } = useToastStore.getState();

const ScreenLoader = () => (
  <div className="empty">
    <h3>Loading...</h3>
  </div>
);

export const App: React.FC = () => {
  const allGames = useGamesStore((s) => s.allGames);
  const loading = useGamesStore((s) => s.loading);
  const loadGames = useGamesStore((s) => s.loadGames);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchCart = useCartStore((s) => s.fetchCart);

  const view = useUiStore((s) => s.view);
  const activeOverlay = useUiStore((s) => s.activeOverlay);
  const selectedGame = useUiStore((s) => s.selectedGame);
    const editingGame = useUiStore((s) => s.editingGame);

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

  const handleOpenDetail = useCallback((id: number) => {
    const game = useGamesStore.getState().allGames.find((g) => g.id === id);
    if (game) openDetail(game);
  }, []);

  const handleOpenEdit = useCallback((id: number) => {
    const game = useGamesStore.getState().allGames.find((g) => g.id === id);
    if (game) openEdit(game);
  }, []);

  const handleSave = useCallback(async (data: GameFormData) => {
    const { updateGame, addGame } = useGamesStore.getState();
    const editing = useUiStore.getState().editingGame;
    try {
      if (editing) {
        await updateGame(editing.id, data);
        showToast("Game updated successfully");
      } else {
        await addGame(data);
        showToast("Game created successfully");
      }
      closeOverlay();
    } catch (err: any) {
      showError(err.message || "Failed to save game");
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      await useGamesStore.getState().deleteGame(id);
      showToast("Game deleted successfully");
      closeOverlay();
      backToCatalog();
    } catch (err: any) {
      showError(err.message || "Failed to delete game");
    }
  }, []);

  return (
    <div className="app">
      <Header
        query={filters.query}
        onQueryChange={setQuery}
        totalCount={filteredGames.length}
        onAddClick={openCreate}
        onCartClick={openCart}
      />

      <Suspense fallback={<ScreenLoader />}>
        {view === "cart" && <CartPage onBack={backToCatalog} />}

        {view === "detail" && selectedGame && (
          <GameDetail
            game={selectedGame}
            onEdit={handleOpenEdit}
            onDelete={handleDelete}
            onBack={backToCatalog}
          />
        )}
      </Suspense>

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
              onOpen={handleOpenDetail}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <Overlay isOpen={activeOverlay === "form"} onClose={closeOverlay}>
        {activeOverlay === "form" && (
          <Suspense fallback={null}>
            <GameForm game={editingGame} onSave={handleSave} onCancel={closeOverlay} />
          </Suspense>
        )}
      </Overlay>

      <Toast />
    </div>
  );
};

export default App;