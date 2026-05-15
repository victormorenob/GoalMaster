// backend/src/utils/controllerFactory.js
const AppError = require('./AppError');

/**
 * Extracts the authenticated user ID from the request.
 * @param {object} req - The Express request object.
 * @returns {number} The user ID.
 * @throws {AppError} If the user ID is not found.
 */
const getAuthUserId = (req) => {
    const userId = req.user?.id;
    if (!userId) {
        throw new AppError('Authentication error: user ID not found.', 401);
    }
    return userId;
};

/**
 * Creates a standard controller that handles common service-calling logic.
 * @param {Function} serviceFunction - The service function to execute.
 * @param {Array<'userId'|'params'|'query'|'body'>} params - The parameters to pass to the service function.
 * @param {object} [options] - Optional configuration.
 * @param {number} [options.statusCode=200] - HTTP status code for the response.
 */
exports.createController = (serviceFunction, params = ['userId'], options = {}) => {
    const { statusCode = 200 } = options;
    return async (req, res, next) => {
        try {
            const args = [];
            if (params.includes('userId')) args.push(getAuthUserId(req));
            if (params.includes('params')) args.push(req.params);
            if (params.includes('query')) args.push(req.query);
            if (params.includes('body')) args.push(req.body);

            const result = await serviceFunction(...args);

            if (statusCode === 204) {
                return res.status(204).send();
            }

            res.status(statusCode).json({
                status: 'success',
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
};