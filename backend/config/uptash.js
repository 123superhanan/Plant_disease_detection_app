import { Ratelimit } from '@upstash/rateLimit';
import { Redis } from '@upstash/redis';
import 'dotenv/config';
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '60 s'),
});
export default ratelimit;
