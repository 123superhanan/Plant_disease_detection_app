import { Redis } from '@upstash/redis';
import { RateLimit } from '@upstash/rateLimit';
const redis = new Redis({
  redis: Redis.fromEnv(),
  limiter: RateLimit.slidingWindow(10, '60 s'),
});
