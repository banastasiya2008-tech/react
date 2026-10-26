import { redisClient, isRedisReady } from './client.js';

export const TTL = {
  game: 600,   
  list: 300,   
};
export async function cached<T>(key: string, ttl: number, loader: () => Promise<T>): Promise<T> {
  if (isRedisReady()) {
    try {
      const hit = await redisClient.get(key);
      if (hit) return JSON.parse(hit) as T;
    } catch { /* fall back to the DB */ }
  }

  const fresh = await loader(); 

  if (isRedisReady() && fresh !== null && fresh !== undefined) {
    try {
      await redisClient.set(key, JSON.stringify(fresh), { EX: ttl });
    } catch { /* not critical */ }
  }
  return fresh;
}

async function deleteByPattern(pattern: string) {
  const keys: string[] = [];
  for await (const batch of redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    keys.push(...(Array.isArray(batch) ? batch : [batch]));
  }
  if (keys.length > 0) await redisClient.del(keys);
}

export async function invalidateGames(gameId?: number) {
  if (!isRedisReady()) return;
  try {
    if (gameId !== undefined) await redisClient.del(`game:${gameId}`);
    await deleteByPattern('games:list:*');
    await deleteByPattern('games:search:*');
  } catch (e: any) {
    console.warn('[redis] failed to clear cache:', e.message);
  }
}