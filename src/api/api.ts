import { Game, PaginatedResult } from "../types";

const API_BASE_URL = 'http://localhost:5003/api/games';

const DESCRIPTIONS: Record<string, { dev: string; pub: string; desc: string; tags: string[] }> = {
  "The Witcher 3: Wild Hunt": {
    dev: "CD Projekt Red",
    pub: "CD Projekt",
    desc: "An epic open-world RPG following Geralt of Rivia across a war-ravaged fantasy world.",
    tags: ["open world", "story"]
  },
  "Elden Ring": {
    dev: "FromSoftware",
    pub: "Bandai Namco",
    desc: "An open-world soulslike set in the shattered Lands Between.",
    tags: ["difficult", "dark fantasy"]
  },
  "Cyberpunk 2077": {
    dev: "CD Projekt Red",
    pub: "CD Projekt",
    desc: "An open-world RPG set in the sprawling Night City.",
    tags: ["open world", "cyberpunk"]
  },
  "Hollow Knight": {
    dev: "Team Cherry",
    pub: "Team Cherry",
    desc: "A challenging 2D metroidvania set in the underground kingdom of Hallownest.",
    tags: ["indie", "metroidvania"]
  },
  "God of War Ragnarök": {
    dev: "Santa Monica Studio",
    pub: "Sony",
    desc: "Kratos and Atreus journey through the Nine Realms as Ragnarök looms.",
    tags: ["story", "mythology"]
  },
  "Songs of Silence": {
    dev: "Chimera Entertainment",
    pub: "Chimera Entertainment",
    desc: "A strategy game with RPG elements.",
    tags: ["strategy", "fantasy"]
  }
};

const mapApiGame = (g: Record<string, unknown>): Game => {
  const title = typeof g.title === 'string' ? g.title : 'Unknown';
  const extra = DESCRIPTIONS[title] || { dev: "Unknown", pub: "Unknown", desc: "No description available", tags: [] };

  const platform = Array.isArray(g.platform) ? g.platform : [g.platform].filter(Boolean) as string[];

  return {
    id:      typeof g.id === 'number' ? g.id : 0,
    name:    title ?? "Unknown",
    genre:   typeof g.genre === 'string' ? g.genre : "Unknown",
    year:    typeof g.releaseYear === 'number' ? g.releaseYear : null,
    dev:     typeof g.developer === 'string' ? g.developer : extra.dev,
    pub:     typeof g.publisher === 'string' ? g.publisher : extra.pub,
    score:   typeof g.rating === 'number' ? g.rating : 0,
    plat:    platform,
    cover:   typeof g.coverImage === 'string' ? g.coverImage : "",
    tags:    Array.isArray(g.tags) ? g.tags as string[] : extra.tags,
    desc:    typeof g.description === 'string' ? g.description : extra.desc,
  };
};

export const getGames = async (): Promise<Game[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error(`Error: ${response.status}`);

    const result: PaginatedResult<Record<string, unknown>> = await response.json();
    const rawGames = result.data ?? [];

    return rawGames.map(mapApiGame);
};

export const getGameById = async (id: number): Promise<Game | undefined> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);
    if (!response.ok) return undefined;
    const g = await response.json() as Record<string, unknown>;
    return mapApiGame(g);
};

export const createGame = async (data: Record<string, unknown>): Promise<Game> => {
    const response = await fetch(`${API_BASE_URL}/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create");
    const g = await response.json() as Record<string, unknown>;
    return mapApiGame(g);
};

export const updateGame = async (id: number, data: Record<string, unknown>): Promise<Game> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update");
    const g = await response.json() as Record<string, unknown>;
    return mapApiGame(g);
};

export const deleteGame = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error("Failed to delete");
};
