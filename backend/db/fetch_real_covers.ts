/**
 * Автоматически подтягивает обложки игр из Wikipedia (бесплатно, без
 * регистрации и API-ключей) и записывает их в поле cover_image в БД.
 *
 * Как использовать (из папки backend):
 *   npx tsx db/fetch_real_covers.ts
 */
import dotenv from 'dotenv';
import pool from '../src/utils/db.utils.js';

dotenv.config();

const HEADERS = {
  'User-Agent': 'VaultGameLibrary/1.0 (educational project; contact: none)',
};

// Пауза между запросами к Wikipedia — увеличена, чтобы не ловить 429.
const DELAY_MS = 1200;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** fetch с повтором при 429/5xx (до 4 попыток с растущей паузой) */
async function fetchWithRetry(url: string, attempt = 1): Promise<Response> {
  const res = await fetch(url, { headers: HEADERS });
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const wait = 1500 * attempt;
    console.log(`      [HTTP ${res.status}, повтор через ${wait}мс]`);
    await sleep(wait);
    return fetchWithRetry(url, attempt + 1);
  }
  return res;
}

interface SearchAttempt {
  src: string | null;
  pageTitle: string | null;
  status?: number;
}

/**
 * Один запрос делает и поиск, и получение картинки одновременно
 * (generator=search + prop=pageimages), вместо двух отдельных запросов.
 */
async function searchAndGetImage(query: string): Promise<SearchAttempt> {
  const url =
    `https://en.wikipedia.org/w/api.php?action=query&generator=search` +
    `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1` +
    `&prop=pageimages&piprop=thumbnail&pithumbsize=600` +
    `&format=json`;

  const res = await fetchWithRetry(url);
  if (!res.ok) return { src: null, pageTitle: null, status: res.status };

  const data = await res.json();
  const pages = data?.query?.pages;
  if (!pages) return { src: null, pageTitle: null };

  const page: any = Object.values(pages)[0];
  return {
    src: page?.thumbnail?.source || null,
    pageTitle: page?.title || null,
  };
}

/**
 * Сначала пробуем точное название игры как есть (обычно так и находится
 * правильная статья). Если не вышло — пробуем с уточнением "video game",
 * которое помогает для совсем общих названий, но иногда может увести
 * не туда (например, в статью про экранизацию), поэтому это только запасной вариант.
 */
async function findCover(gameTitle: string): Promise<{ src: string | null; via: string | null }> {
  const attempt1 = await searchAndGetImage(gameTitle);
  if (attempt1.src) return { src: attempt1.src, via: attempt1.pageTitle };
  if (attempt1.status) return { src: null, via: null }; // ошибка сети/429 — не пробуем дальше зря

  await sleep(DELAY_MS);

  const attempt2 = await searchAndGetImage(`${gameTitle} video game`);
  if (attempt2.src) return { src: attempt2.src, via: attempt2.pageTitle };

  return { src: null, via: null };
}

async function main() {
  const { rows } = await pool.query(
    `SELECT id, title, cover_image FROM games
     WHERE cover_image IS NULL OR cover_image = '' OR cover_image LIKE '%placehold.co%'`
  );

  console.log(`Найдено ${rows.length} игр(ы) без реальной обложки.`);

  let ok = 0, skipped = 0;

  for (const game of rows) {
    process.stdout.write(`  ${game.title} ... `);
    try {
      const result = await findCover(game.title);
      if (result.src) {
        await pool.query('UPDATE games SET cover_image = $1 WHERE id = $2', [result.src, game.id]);
        console.log(`OK (${result.via})`);
        ok++;
      } else {
        console.log('не найдено, пропущено');
        skipped++;
      }
    } catch (err: any) {
      console.log('ошибка: ' + err.message);
      skipped++;
    }
    await sleep(DELAY_MS);
  }

  console.log(`\nГотово! Обновлено: ${ok}, пропущено: ${skipped}.`);
  if (skipped > 0) {
    console.log('Скрипт можно запускать повторно — он трогает только игры без реальной обложки,');
    console.log('так что уже найденные картинки не пострадают.');
  }
  await pool.end();
}

main();