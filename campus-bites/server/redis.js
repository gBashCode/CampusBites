const Redis = require('ioredis');

let redis = null;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => console.log('Redis connected'));
  redis.on('error', (err) => console.error('Redis error:', err.message));
} else {
  console.warn('REDIS_URL not set — running without Redis cache');
}

const cacheGet = async (key) => {
  if (!redis) return null;
  try {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const cacheSet = async (key, value, ttlSeconds = 300) => {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {}
};

const cacheDel = async (key) => {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
};

const cacheDelPattern = async (pattern) => {
  if (!redis) return;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {}
};

// Live order status in Redis
const setOrderStatus = async (orderId, status) => {
  if (!redis) return;
  try {
    await redis.set(`order:status:${orderId}`, status, 'EX', 86400);
    await redis.publish('orderUpdates', JSON.stringify({ orderId, status }));
  } catch {}
};

const getOrderStatus = async (orderId) => {
  if (!redis) return null;
  try {
    return await redis.get(`order:status:${orderId}`);
  } catch { return null; }
};

// Cart cache
const setCart = async (userId, cartItems) => {
  if (!redis) return;
  try {
    await redis.set(`cart:${userId}`, JSON.stringify(cartItems), 'EX', 86400);
  } catch {}
};

const getCart = async (userId) => {
  if (!redis) return null;
  try {
    const val = await redis.get(`cart:${userId}`);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

const delCart = async (userId) => {
  if (!redis) return;
  try {
    await redis.del(`cart:${userId}`);
  } catch {}
};

module.exports = {
  redis,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheDelPattern,
  setOrderStatus,
  getOrderStatus,
  setCart,
  getCart,
  delCart,
};
