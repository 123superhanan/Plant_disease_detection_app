import ratelimit from '../config/uptash.js';
const ratelimiter = async (req, res, next) => {
  try {
    const { success } = await ratelimit.limit('my-rate-limit');
    if (!success) {
      return res.status(429).json({ message: 'Too Many Request. please try again later' });
    }
    next();
  } catch (error) {
    console.log('ratelimiter error', error);
    next(error);
  }
};
export default ratelimiter;
