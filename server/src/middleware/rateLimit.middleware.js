const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.API_RATE_LIMIT) || 100,
    handler: (req, res) => {
        res.status(429).json({
            "message": "Too many requests. Please try again later."
        });
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: Number(process.env.AUTH_RATE_LIMIT) || 10,
    handler: (req, res) => {
        res.status(429).json({
            "message": "Too many authentication attempts. Please try again later."
        });
    }
})

module.exports = {apiLimiter, authLimiter};