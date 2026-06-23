// backend/src/middlewares/avatarMiddleware.js
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const AVATAR_DIR = path.resolve(__dirname, '../../../public/uploads/avatars');

exports.serveAvatar = (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) return next(new AppError('Autenticación requerida.', 401));

        const filename = path.basename(req.params.filename);
        if (!filename.startsWith(`user-${userId}-avatar-`)) {
            return next(new AppError('No autorizado para acceder a este avatar.', 403));
        }

        const filePath = path.join(AVATAR_DIR, filename);
        if (!filePath.startsWith(AVATAR_DIR) || !fs.existsSync(filePath)) {
            return next(new AppError('Avatar no encontrado.', 404));
        }

        res.sendFile(filePath);
    } catch (error) {
        next(error);
    }
};
