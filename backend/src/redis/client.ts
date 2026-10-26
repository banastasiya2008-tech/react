import { createClient } from 'redis';

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  disableOfflineQueue: true,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 200, 5000),
  },
});

let lastErrorLogged = 0;
redisClient.on('error', (err) => {
  if (Date.now() - lastErrorLogged > 10_000) {
    lastErrorLogged = Date.now();
    console.warn('[redis] unavailable, running without cache:', err.message);
  }
});
redisClient.on('ready', () => console.log('[redis] connected'));

export async function connectRedis(): Promise<void> {
  if (process.env.REDIS_DISABLED === 'true') {
    console.log('[redis] disabled via REDIS_DISABLED');
    return;
  }
  redisClient.connect().catch(() => {  /* errors are already handled by on('error') */ });
  await new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, 2000);
    redisClient.once('ready', () => { clearTimeout(timer); resolve(); });
  });
}

export const isRedisReady = () => redisClient.isReady;