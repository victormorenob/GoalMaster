// backend/src/middlewares/profileValidation.js
const { body, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new AppError('Se encontraron errores de validación.', 400, errors.array()));
    }
    next();
};

exports.validateProfileUpdate = [
    body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.'),
    body('bio').optional().trim().isLength({ max: 500 }).withMessage('La biografía no puede superar 500 caracteres.'),
    body('location').optional().trim().isLength({ max: 255 }).withMessage('La ubicación no puede superar 255 caracteres.'),
    body('phone').optional().trim().isLength({ max: 25 }).withMessage('El teléfono no puede superar 25 caracteres.'),
    handleValidationErrors,
];

exports.validateChangePassword = [
    body('currentPassword').notEmpty().withMessage('La contraseña actual es obligatoria.'),
    body('newPassword').isLength({ min: 8 }).withMessage('La nueva contraseña debe tener al menos 8 caracteres.'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.newPassword) throw new Error('Las contraseñas no coinciden.');
        return true;
    }),
    handleValidationErrors,
];

exports.validateDeleteAccount = [
    body('currentPassword').notEmpty().withMessage('Debe confirmar su contraseña actual para eliminar la cuenta.'),
    handleValidationErrors,
];
