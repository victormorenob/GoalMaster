// backend/src/utils/getAuthUserId.js
const AppError = require('./AppError');

/**
 * Safely extracts the authenticated user ID from the request.
 * @param {object} req - The Express request object.
 * @returns {number} The user ID.
 * @throws {AppError} If the user ID is not found.
 */
const getAuthUserId = (req) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError('Error de autenticación: ID de usuario no encontrado.', 401);
    }
    return userId;
};

module.exports = getAuthUserId;