const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
require('dotenv').config();

/**
 * Middleware to verify user authentication via JWT token.
 * Expects an 'Authorization' header with the format 'Bearer <token>'.
 * If authentication succeeds, attaches the decoded user payload to `req.user`.
 * Otherwise, passes an AppError to the next error middleware.
 *
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The function to pass to the next middleware.
 */
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Acceso denegado. Token no proporcionado o con formato incorrecto.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return next(new AppError('Acceso denegado. Token no encontrado en la cabecera.', 401));
    }

    // Make the secret loading environment-aware.
    const secret = process.env.NODE_ENV === 'test' 
        ? process.env.JWT_SECRET_TEST 
        : process.env.JWT_SECRET;

    if (!secret) {
        // Add a safety check in case the secret is not defined
        console.error("FATAL: JWT_SECRET is not defined for verification in the current environment.");
        return next(new AppError('Error de configuración del servidor de autenticación.', 500));
    }

    jwt.verify(token, secret, (err, decodedUserPayload) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return next(new AppError('Token expirado. Por favor, inicie sesión de nuevo.', 401));
            }
            // Covers 'JsonWebTokenError' and other verification errors
            return next(new AppError('Token inválido. La autenticación ha fallado.', 403));
        }
        
        // Attach the decoded payload to the request for downstream use
        req.user = decodedUserPayload; 
        next();
    });
};

module.exports = authMiddleware;