import type { RequestHandler } from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redisClient, isRedisReady } from '../redis/client.js';

const num = (v: string | undefined, d: number) => (v && !isNaN(+v) ? +v : d);
const makers: Array<() => void> = [];

function lazy(make: () => RequestHandler): RequestHandler {
  let handler: RequestHandler | undefined;
  makers.push(() => { handler = make(); });
  return (req, res, next) => {
    if (!handler) { next(); return; }
    return handler(req, res, next);
  };
}

export function initRateLimiters() {
  makers.forEach((init) => init());
}

function build(prefix: string, windowMs: number, max: number, message: string, skipSuccessful = false) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: skipSuccessful,
    passOnStoreError: true,
    message: { error: message, message },
    store: isRedisReady()
      ? new RedisStore({
          prefix: `rl:${prefix}:`,
          sendCommand: (...args: string[]) => redisClient.sendCommand(args),
        })
      : undefined,
  });
}

export const loginLimiter = lazy(() =>
  build('login', 15 * 60 * 1000, num(process.env.LOGIN_RATE_MAX, 10),
    'Too many login attempts. Please try again later.'));

export const registerLimiter = lazy(() =>
  build('register', 60 * 60 * 1000, num(process.env.REGISTER_RATE_MAX, 10),
    'Too many registrations. Please try again later.'));

export const apiLimiter = lazy(() =>
  build('api', 15 * 60 * 1000, num(process.env.API_RATE_MAX, 1000),
    'Too many requests. Please try again later.'));