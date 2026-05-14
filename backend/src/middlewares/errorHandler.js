// backend/src/middlewares/errorHandler.js
const AppError = require('../utils/AppError');

/**
 * Sends a detailed error response for the development environment.
 * @param {Error} err - The error object.
 * @param {object} res - The Express response object.
 */
const sendErrorDev = (err, res) => {
    console.error('ERROR DEVELOPMENT 💥:', err);

    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        error: {
            name: err.name,
            message: err.message,
            ...err, // Includes other error properties like `errorsData`
        },
        stack: err.stack,
    });
};

/**
 * Sends a generic, safe error response for the production environment.
 * @param {Error} err - The error object.
 * @param {object} res - The Express response object.
 */
const sendErrorProd = (err, res) => {
    // If it is an operational AppError, trust it and send to the client.
    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            // Include validation details if they exist
            ...(err.errorsData && { errors: err.errorsData }),
        });
    }

    // If not operational, log the full error for developers.
    console.error('ERROR PRODUCTION 💣:', err);

    // Send a generic message to the client to avoid exposing details.
    return res.status(500).json({
        status: 'error',
        message: 'Ocurrió un problema en el servidor. Por favor, inténtelo de nuevo más tarde.',
    });
};

/**
 * Converts known technical errors into operational errors (AppError).
 * @param {Error} error - The original error.
 * @returns {AppError | Error} - An AppError if the error is known, or the original error.
 */
const handleKnownErrors = (error) => {
    if (error.name === 'SequelizeValidationError') {
        const messages = error.errors.map(e => e.message).join('. ');
        return new AppError(`Error de validación: ${messages}`, 400, error.errors);
    }
    if (error.name === 'SequelizeUniqueConstraintError') {
        const field = Object.keys(error.fields)[0] || 'campo';
        return new AppError(`El valor proporcionado para '${field}' ya está en uso.`, 409, error.fields);
    }
    if (error.name === 'JsonWebTokenError') {
        return new AppError('Token de autenticación inválido. Por favor, inicie sesión de nuevo.', 401);
    }
    if (error.name === 'TokenExpiredError') {
        return new AppError('Su sesión ha expirado. Por favor, inicie sesión de nuevo.', 401);
    }
    return error;
};


/**
 * Middleware de manejo de errores principal.
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || (String(err.statusCode).startsWith('4') ? 'fail' : 'error');

    if (process.env.NODE_ENV === 'production') {
        let errorForClient = handleKnownErrors(err);
        sendErrorProd(errorForClient, res);
    } else {
        sendErrorDev(err, res);
    }
};

module.exports = errorHandler;