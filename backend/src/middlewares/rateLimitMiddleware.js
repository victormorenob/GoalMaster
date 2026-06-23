// backend/src/middlewares/rateLimitMiddleware.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Demasiados intentos. Inténtelo de nuevo en un minuto.' },
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'fail', message: 'Demasiadas solicitudes. Inténtelo más tarde.' },
});

module.exports = { authLimiter, apiLimiter };
