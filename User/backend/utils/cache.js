// Simple in-memory cache
const cache = new Map();

export const getCached = key => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

export const setCached = (key, value, ttlSeconds = 300) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
};
