// backend/src/middlewares/userValidation.js
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

/**
 * Middleware that processes express-validator validation results.
 * If there are errors, wraps them in an AppError and passes to the global errorHandler.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Use AppError for centralized and consistent error handling.
        return next(new AppError('Se encontraron errores de validación.', 400, errors.array()));
    }
    next();
};

/**
 * Validation chain for user registration.
 * Validates username, email, password, and password confirmation.
 */
exports.validateRegistration = [
    body('username')
        .trim()
        .notEmpty().withMessage('El nombre de usuario es obligatorio.')
        .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.'),
    
    body('email')
        .trim()
        .isEmail().withMessage('El formato del correo electrónico es inválido.'),

    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Las contraseñas no coinciden.');
            }
            return true;
        }),

    handleValidationErrors
];

/**
 * Validation chain for login.
 * Validates email format and that password is not empty.
 */
exports.validateLogin = [
    body('email')
        .trim()
        .isEmail().withMessage('El formato del correo electrónico es inválido.'),
    
    body('password')
        .notEmpty().withMessage('La contraseña es obligatoria.'),

    handleValidationErrors
];

/**
 * Validation chain for user profile update.
 * Fields are optional, but if provided, they are validated.
 */
exports.validateUserUpdate = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.'),
    
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('El formato del correo electrónico es inválido.'),
    
    // Note: Password change validation is more complex (requires current password)
    // and is handled in a dedicated endpoint and service, so it is not included here.

    handleValidationErrors
];