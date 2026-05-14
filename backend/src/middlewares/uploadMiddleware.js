// backend/src/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');

const UPLOAD_DIR = path.resolve(__dirname, '../../../public/uploads/avatars');

// Ensure the upload directory exists when the application starts.
// If it cannot be created, throw a critical error to halt server startup.
try {
    if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`[UploadMiddleware] Avatar directory created at: ${UPLOAD_DIR}`);
    }
} catch (err) {
    const errorMsg = `[UploadMiddleware] FATAL: Could not create upload directory ${UPLOAD_DIR}. Error: ${err.message}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // The user must be authenticated to upload an avatar. `authMiddleware` must run first.
        if (!req.user || !req.user.id) {
            return cb(new AppError('Autenticación requerida para subir archivos.', 401));
        }
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const extension = path.extname(file.originalname).toLowerCase();
        const filename = `user-${req.user.id}-avatar-${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // File accepted
    } else {
        // File rejected, passing an AppError for consistent error handling.
        cb(new AppError('Formato de archivo no permitido. Solo se aceptan imágenes (jpeg, png, gif, webp).', 400), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

/**
 * Middleware wrapper that handles uploading a single file named 'avatar'.
 * Captures and formats Multer errors into AppError instances.
 */
const avatarUploadMiddleware = (req, res, next) => {
    const uploader = upload.single('avatar');

    uploader(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new AppError('El archivo es demasiado grande. El límite es de 5MB.', 400));
                }
                // Handle other Multer errors (e.g. 'LIMIT_UNEXPECTED_FILE')
                return next(new AppError(`Error al procesar el archivo: ${err.message}.`, 400));
            }
            // If the error is already an AppError (e.g. from our fileFilter)
            if (err instanceof AppError) {
                return next(err);
            }
            // Other unexpected errors
            return next(new AppError('Ocurrió un error inesperado durante la subida del archivo.', 500, err));
        }
        // If no error, req.file will be available for the next controller.
        next();
    });
};

module.exports = avatarUploadMiddleware;