const rateLimit = require('express-rate-limit');
const response = require('../utils/response');

const quickReplyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each user to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    if (req.customer && req.customer.id) {
      return `customer-${req.customer.id}`;
    }
    if (req.user && req.user.id) {
      return `user-${req.user.id}`;
    }
    return req.ip;
  },
  validate: false,
  handler: (req, res) => {
    return response.error(
      res,
      'Batas pengajuan pertanyaan cepat telah tercapai. Maksimal 10 pertanyaan per jam.',
      429
    );
  },
});

module.exports = { quickReplyRateLimiter };
