import React, { useState, useEffect } from "react";
import type { Game, GameFormData } from "../types";

const PLATFORMS = [
  "PC",
  "PS5",
  "PS4",
  "Xbox Series X",
  "Xbox One",
  "Switch",
  "Mobile",
];

interface GameFormProps {
  game: Game | null;
  onSave: (data: GameFormData) => void;
  onCancel: () => void;
}

export const GameForm: React.FC<GameFormProps> = ({ game, onSave, onCancel }) => {
  const [formData, setFormData] = useState<GameFormData>({
    name: "",
    genre: "",
    year: null,
    dev: "",
    pub: "",
    score: 7.5,
    plat: [],
    cover: "",
    tags: [],
    desc: "",
    price: 0,
  });

  useEffect(() => {
    if (game) {
      setFormData({
        name: game.name,
        genre: game.genre,
        year: game.year,
        dev: game.dev,
        pub: game.pub,
        score: Number(game.score) || 0,
        plat: game.plat,
        cover: game.cover,
        tags: game.tags,
        desc: game.desc,
        price: Number(game.price) || 0,
      });
    } else {
      setFormData({
        name: "",
        genre: "",
        year: null,
        dev: "",
        pub: "",
        score: 7.5,
        plat: [],
        cover: "",
        tags: [],
        desc: "",
        price: 0,
      });
    }
  }, [game]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, year: value === "" ? null : parseInt(value, 10) }));
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, score: parseFloat(e.target.value) }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, price: value === "" ? 0 : parseFloat(value) }));
  };

  const handlePlatformToggle = (plat: string) => {
    setFormData((prev) => ({
      ...prev,
      plat: prev.plat.includes(plat)
        ? prev.plat.filter((p) => p !== plat)
        : [...prev.plat, plat],
    }));
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (!formData.genre) return;
    onSave(formData);
  };

  const scoreStr = Number(formData.score || 0).toFixed(1);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>{game ? `EDIT — ${game.name.toUpperCase()}` : "ADD NEW GAME"}</h2>
        <button type="button" className="btn-close" onClick={onCancel}>
          ×
        </button>
      </div>
      <div className="form-body">
        <div className="form-row">
          <label>Title</label>
          <input
            type="text"
            name="name"
            placeholder="Game title"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Genre</label>
          <select name="genre" value={formData.genre} onChange={handleChange}>
            <option value="">Select genre</option>
            <option value="RPG">RPG</option>
            <option value="Action">Action</option>
            <option value="Shooter">Shooter</option>
            <option value="Platformer">Platformer</option>
            <option value="Strategy">Strategy</option>
            <option value="Adventure">Adventure</option>
            <option value="Sports">Sports</option>
          </select>
        </div>
        <div className="form-row">
          <label>Year</label>
          <input
            type="number"
            name="year"
            placeholder="2024"
            value={formData.year ?? ""}
            onChange={handleYearChange}
          />
        </div>
        <div className="form-row">
          <label>Developer</label>
          <input
            type="text"
            name="dev"
            placeholder="Studio name"
            value={formData.dev}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Publisher</label>
          <input
            type="text"
            name="pub"
            placeholder="Publisher name"
            value={formData.pub}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>
            Score <span>{scoreStr}</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={formData.score}
            onChange={handleScoreChange}
          />
          <span className="score-big">{scoreStr}</span>
        </div>
        <div className="form-row">
          <label>Price, $</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={formData.price}
            onChange={handlePriceChange}
          />
        </div>
        <div className="form-row">
          <label>Platforms</label>
          <div className="plat-chips">
            {PLATFORMS.map((p) => (
              <label key={p} className="plat-chip">
                <input
                  type="checkbox"
                  checked={formData.plat.includes(p)}
                  onChange={() => handlePlatformToggle(p)}
                />{" "}
                {p}
              </label>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label>Cover URL</label>
          <input
            type="text"
            name="cover"
            placeholder="https://..."
            value={formData.cover}
            onChange={handleChange}
          />
        </div>
        <div className="form-row">
          <label>Tags (comma separated)</label>
          <input
            type="text"
            placeholder="open world, story, multiplayer"
            value={formData.tags.join(", ")}
            onChange={handleTagsChange}
          />
        </div>
        <div className="form-row">
          <label>Description</label>
          <textarea
            name="desc"
            rows={4}
            placeholder="Game description..."
            value={formData.desc}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          Save
        </button>
      </div>
    </form>
  );
}