const Redis = require('ioredis');

// Redis is a pure optimisation layer — every helper below swallows its own errors and degrades to a
// cache-miss instead of throwing, so the app works the same whether or not Redis is reachable.

let client = null;

// Opt-in: set CACHE_DEBUG=true to log every cache HIT/MISS/BYPASS and confirm Redis is actually in use.
const cacheDebug = process.env.CACHE_DEBUG === 'true';
const logCache = (event, key) => {
  if (cacheDebug) console.log(`[cache] ${event} ${key}`);
};

if (cacheDebug) console.log('ℹ Cache debug logging enabled (CACHE_DEBUG=true)');

if (process.env.REDIS_URL) {
  client = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,   // fail a single command fast instead of blocking the request
    enableOfflineQueue: false, // don't buffer commands while disconnected — fail fast instead
  });

  client.on('connect', () => console.log('✓ Redis connected'));
  client.on('error', (err) => {
    // Logged, never thrown. err.code (e.g. ECONNREFUSED) is more useful here than err.message, which is often empty.
    console.error('[redis] connection error:', err.code || err.message);
  });
} else {
  console.log('ℹ Redis not configured (REDIS_URL unset) — running without cache');
}

const cacheGet = async (key) => {
  if (!client) return null;
  try {
    return await client.get(key);
  } catch (err) {
    console.error(`[redis] GET ${key} failed:`, err.message);
    return null;
  }
};

const cacheSet = async (key, value, ttlSeconds) => {
  if (!client) return;
  try {
    await client.set(key, value, 'EX', ttlSeconds);
  } catch (err) {
    console.error(`[redis] SET ${key} failed:`, err.message);
  }
};

// Standard cache-aside: serve a hit straight from Redis; on a miss, call fetchFn and cache its result.
const cacheAside = async (key, ttlSeconds, fetchFn) => {
  const cached = await cacheGet(key);

  if (cached !== null) {
    try {
      const parsed = JSON.parse(cached);
      logCache('HIT', key);
      return parsed;
    } catch (err) {
      console.error(`[redis] corrupt cache value for ${key}, ignoring:`, err.message);
    }
  }

  logCache('MISS', key);
  const fresh = await fetchFn();
  await cacheSet(key, JSON.stringify(fresh), ttlSeconds);
  return fresh;
};

const disconnect = async () => {
  if (!client) return;
  await client.quit().catch(() => {});
};

module.exports = { cacheGet, cacheSet, cacheAside, logCache, disconnect };
