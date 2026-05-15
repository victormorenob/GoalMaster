// backend/src/api/services/settingsService.js
const db = require('../../config/database');
const { User, Objective, Progress, ActivityLog } = db;
const AppError = require('../../utils/AppError');
const activityLogRepository = require('../repositories/activityLogRepository');

/**
 * Service layer for user settings and account management.
 */
class SettingsService {
    constructor(activityLogRepo) {
        this.activityLogRepository = activityLogRepo || activityLogRepository;
    }
    /**
     * Fetches a user's application settings.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<object>} The user's settings.
     */
    async fetchUserSettings(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['themePreference', 'languagePreference'] // Add more preferences here if they exist
        });
        if (!user) {
            throw new AppError('Usuario no encontrado al buscar configuración.', 404);
        }
        return user.toJSON();
    }

    /**
     * Updates a user's settings.
     * @param {number} userId - The ID of the user.
     * @param {object} settingsData - The settings data to update.
     * @returns {Promise<{message: string}>} A confirmation message.
     */
    async updateUserSettings(userId, settingsData) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado para actualizar configuración.', 404);
        }
        
        // With consistent keys between frontend and backend, mapping is no longer needed.
        // It is assumed that `settingsData` contains keys like `themePreference`, `languagePreference`.
        await user.update(settingsData);
        await this.activityLogRepository.create({
            userId,
            activityType: 'USER_SETTINGS_UPDATED',
            descriptionKey: 'activityLog.settingsUpdated',
        });
        return { message: 'Configuración actualizada con éxito.' };
    }

    /**
     * Changes a user's password.
     * @param {number} userId - The ID of the user.
     * @param {string} currentPassword - The user's current password.
     * @param {string} newPassword - The new password.
     * @returns {Promise<{message: string}>} A confirmation message.
     */
    async changeUserPassword(userId, currentPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            throw new AppError('La contraseña actual es incorrecta.', 400);
        }

        // The 'beforeUpdate' hook in the User model will handle hashing the new password.
        user.password = newPassword;
        await user.save();
        await this.activityLogRepository.create({
            userId,
            activityType: 'USER_PASSWORD_CHANGED',
            descriptionKey: 'activityLog.passwordChanged',
        });
        return { message: 'Contraseña actualizada con éxito.' };
    }

    /**
     * Exports all data associated with a user account.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<object>} A JSON object with all user data.
     */
    async exportAllUserData(userId) {
        const user = await User.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                { 
                    model: Objective, 
                    as: 'objectives',
                    // Include Progress WITHIN each Objective
                    include: [{
                        model: Progress,
                        as: 'progressEntries'
                    }]
                },
                { 
                    model: ActivityLog, 
                    as: 'activityLogs'
                },
            ]
        });
        if (!user) {
            throw new AppError('Usuario no encontrado para exportar datos.', 404);
        }

        await this.activityLogRepository.create({
            userId,
            activityType: 'USER_DATA_EXPORTED',
            descriptionKey: 'activityLog.dataExported',
        });
        return user.toJSON();
    }

    /**
     * Deletes a user account and all associated data within a transaction.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<{message: string}>} A confirmation message.
     */
    async deleteUserAccount(userId) {
        const transaction = await db.sequelize.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (!user) {
                await transaction.rollback();
                throw new AppError('Usuario no encontrado para eliminar.', 404);
            }

            await this.activityLogRepository.create({
                userId,
                activityType: 'USER_ACCOUNT_DELETED',
                descriptionKey: 'activityLog.accountDeleted',
                additionalDetails: { username: user.username } // Store the username for reference
            }, { transaction });
            await user.destroy({ transaction });
            await transaction.commit();
            return { message: 'Cuenta de usuario eliminada con éxito.' };
        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Error al eliminar la cuenta del usuario.', 500, error);
        }
    }
}

module.exports = new SettingsService();