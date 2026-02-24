const rateLimit = require('express-rate-limit');

const trackingRateLimiter = rateLimit({
  windowMs: parseInt(process.env.TRACKING_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.TRACKING_RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many tracking requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = {
  trackingRateLimiter,
};