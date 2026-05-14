/**
 * @class AppError
 * @extends Error
 * @description Custom class for handling operational application errors.
 * Allows specifying an HTTP status code, an operational error indicator,
 * and optionally an array of error data (e.g. for validation errors).
 */
class AppError extends Error {
    /**
     * Constructor for AppError.
     * @param {string} message - The error message.
     * @param {number} statusCode - The HTTP status code.
     * @param {Array<Object>|Object} [errorsData] - Additional error data, such as a validation errors array.
     */
    constructor(message, statusCode, errorsData = undefined) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; // Distinguish programming errors from operational errors
        
        if (errorsData) {
            this.errorsData = errorsData; // Store additional error data
        }

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;