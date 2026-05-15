const objectiveRepository = require('../repositories/objectiveRepository');
const db = require('../../config/database');
const AppError = require('../../utils/AppError');
const streakService = require('./streakService');

const { Objective, Progress, ActivityLog } = db;

const calculateProgressPercentage = (objective) => {
    const initial = parseFloat(objective.initialValue);
    const current = parseFloat(objective.currentValue);
    const target = parseFloat(objective.targetValue);
    const isLowerBetter = !!objective.isLowerBetter;

    if (isNaN(initial) || isNaN(target) || isNaN(current)) {
        return 0;
    }

    if (target === initial) {
        if (isLowerBetter) {
            return current <= target ? 100 : 0;
        }
        return current >= target ? 100 : 0;
    }

    let progress;
    if (isLowerBetter) {
        const totalJourney = initial - target;
        const progressMade = initial - current;
        progress = (progressMade / totalJourney) * 100;
    } else {
        const totalJourney = target - initial;
        const progressMade = current - initial;
        progress = (progressMade / totalJourney) * 100;
    }
        
    return Math.max(0, Math.min(100, Math.round(progress)));
};

exports.calculateProgressPercentage = calculateProgressPercentage;

const checkAndUpdateOverdueStatus = (objectiveJson) => {
    const deadline = objectiveJson.endDate ? new Date(objectiveJson.endDate) : null;
    const isOverdue = deadline && deadline < new Date() && !['COMPLETED', 'ARCHIVED'].includes(objectiveJson.status);

    if (isOverdue) {
        objectiveJson.status = 'FAILED';
    }
    return objectiveJson;
};

/**
 * Parse tags from a comma-separated string to an array.
 * @param {string|null} tagsStr - Comma-separated tag string or null.
 * @returns {string[]} Array of trimmed tag names.
 */
const parseTags = (tagsStr) => {
    if (!tagsStr || typeof tagsStr !== 'string') return [];
    return tagsStr.split(',').map(t => t.trim()).filter(Boolean);
};

/**
 * Serialize an array of tag names to a comma-separated string.
 * @param {string[]|string|null} tags - Array of tags or comma-separated string.
 * @returns {string|null} Comma-separated string or null.
 */
const serializeTags = (tags) => {
    if (!tags) return null;
    if (Array.isArray(tags)) {
        return tags.map(t => t.trim()).filter(Boolean).join(',') || null;
    }
    if (typeof tags === 'string') {
        return parseTags(tags).join(',') || null;
    }
    return null;
};

const processObjectiveForResponse = (objective) => {
    let objectiveJson = objective.toJSON();
    objectiveJson = checkAndUpdateOverdueStatus(objectiveJson);
    objectiveJson.progressPercentage = calculateProgressPercentage(objectiveJson);
    
    objectiveJson.initialValue = objectiveJson.initialValue != null ? +objectiveJson.initialValue : null;
    objectiveJson.currentValue = objectiveJson.currentValue != null ? +objectiveJson.currentValue : null;
    objectiveJson.targetValue = objectiveJson.targetValue != null ? +objectiveJson.targetValue : null;
    
    // Parse tags from comma-separated string to array for frontend consumption
    objectiveJson.tags = parseTags(objectiveJson.tags);
    
    return objectiveJson;
};

class ObjectivesService {

    async getAllObjectives(userId, filters = {}) {
        const objectives = await objectiveRepository.findAll(userId, filters);
        
        let processedObjectives = objectives.map(processObjectiveForResponse);

        // Filter by tags if specified (client-side since tags are stored as TEXT)
        if (filters.tags) {
            const filterTags = Array.isArray(filters.tags) ? filters.tags : [filters.tags];
            processedObjectives = processedObjectives.filter(obj => {
                return obj.tags.some(tag => filterTags.includes(tag));
            });
        }

        if (filters.sortBy === 'progressAsc') {
            processedObjectives.sort((a, b) => a.progressPercentage - b.progressPercentage);
        } else if (filters.sortBy === 'progressDesc') {
            processedObjectives.sort((a, b) => b.progressPercentage - a.progressPercentage);
        }
        
        return processedObjectives;
    }

    async getObjectiveById(objectiveId, userId) {
        const objective = await objectiveRepository.findById(objectiveId, userId, {
            include: [{ model: Progress, as: 'progressEntries', order: [['entryDate', 'ASC']] }]
        });
        if (!objective) {
            throw new AppError('Objetivo no encontrado.', 404);
        }
        
        return processObjectiveForResponse(objective);
    }

    async createObjective(objectiveData, userId) {
        const transaction = await db.sequelize.transaction();
        try {
            if (!userId) {
                throw new AppError('No se proporcionó un ID de usuario autenticado.', 401);
            }

            const isQuantitative = (
                objectiveData.initialValue !== null && objectiveData.initialValue !== undefined &&
                objectiveData.targetValue !== null && objectiveData.targetValue !== undefined
            );

            // Serialize tags to comma-separated string for storage
            const dataToCreate = {
                ...objectiveData,
                userId,
                tags: serializeTags(objectiveData.tags),
                initialValue: isQuantitative ? objectiveData.initialValue : null,
                targetValue: isQuantitative ? objectiveData.targetValue : null,
                currentValue: isQuantitative ? objectiveData.initialValue : null,
            };

            const newObjective = await objectiveRepository.create(dataToCreate, { transaction });

            if (isQuantitative) {
                await Progress.create({
                    objectiveId: newObjective.id,
                    userId: userId,
                    entryDate: new Date(),
                    value: newObjective.initialValue,
                    notes: 'Valor inicial del objetivo.'
                }, { transaction });
            }

            await ActivityLog.create({
                userId,
                objectiveId: newObjective.id,
                activityType: 'OBJECTIVE_CREATED',
                descriptionKey: 'activityLog.objectiveCreated',
                additionalDetails: { objectiveName: newObjective.name }
            }, { transaction });

            await transaction.commit();
            return this.getObjectiveById(newObjective.id, userId);

        } catch (error) {
            await transaction.rollback();
            if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
                const messages = error.errors ? error.errors.map(e => e.message).join('. ') : error.message;
                throw new AppError(`Error de validación o de referencia: ${messages}`, 400);
            }
            console.error('Unhandled error in createObjective:', error);
            throw new AppError('Error al crear el objetivo.', 500, error);
        }
    }
    
    async updateObjective(objectiveId, userId, updateData) {
        const transaction = await db.sequelize.transaction();
        try {
            const objective = await objectiveRepository.findById(objectiveId, userId, { transaction });
            if (!objective) {
                throw new AppError('Objetivo no encontrado.', 404);
            }
    
            if (objective.status === 'ARCHIVED') {
                const isOnlyArchiving = Object.keys(updateData).length === 1 && updateData.status === 'ARCHIVED';

                if (!isOnlyArchiving) {
                    throw new AppError('No se puede modificar un objetivo que está archivado. Debes desarchivarlo primero.', 400);
                }
            }

            const originalStatus = objective.status;
            if (updateData.status === 'ARCHIVED' && originalStatus !== 'ARCHIVED') {
                updateData.previousStatus = originalStatus;
            }
            
            const { progressData, ...objectiveData } = updateData;

            // Serialize tags to comma-separated string for storage
            if (objectiveData.tags !== undefined) {
                objectiveData.tags = serializeTags(objectiveData.tags);
            }

            if (Object.keys(objectiveData).length > 0) {
                await objective.update(objectiveData, { transaction });
            }

            if (progressData?.value !== undefined && progressData.value !== null) {
                await this._logProgressUpdate(objective, progressData, userId, transaction);
            }
            
            if (originalStatus !== objective.status) {
                await this._logStatusChange(objective, originalStatus, userId, transaction);
            }

            await transaction.commit();
            return this.getObjectiveById(objective.id, userId);

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Error al actualizar el objetivo.', 500, error);
        }
    }
    
    async _logProgressUpdate(objective, progressData, userId, transaction) {
        const newValue = parseFloat(progressData.value);
        if (isNaN(newValue)) {
            throw new AppError('El valor del progreso debe ser un número.', 400);
        }

        objective.currentValue = newValue;
        await objective.save({ transaction });

        await Progress.create({
            objectiveId: objective.id,
            userId: userId,
            entryDate: new Date(),
            value: newValue,
            notes: progressData.notes || null
        }, { transaction });

        await ActivityLog.create({
            userId,
            objectiveId: objective.id,
            activityType: 'PROGRESS_UPDATED',
            descriptionKey: 'activityLog.progressUpdated',
            additionalDetails: { objectiveName: objective.name, newValue: newValue, unit: objective.unit || '' }
        }, { transaction });

        // Update user streak after progress is logged (non-blocking)
        try {
            await streakService.updateStreak(userId);
        } catch (streakError) {
            console.error('Error updating streak:', streakError);
            // Non-critical — don't fail the progress update
        }
    }

    async _logStatusChange(objective, originalStatus, userId, transaction) {
        let activityType = 'OBJECTIVE_STATUS_CHANGED';
        let descriptionKey = 'activityLog.statusChanged';
        if (objective.status === 'ARCHIVED') {
            activityType = 'OBJECTIVE_ARCHIVED';
            descriptionKey = 'activityLog.objectiveArchived';
        }
        await ActivityLog.create({
            userId,
            objectiveId: objective.id,
            activityType,
            descriptionKey,
            additionalDetails: { 
                objectiveName: objective.name,
                oldStatus: originalStatus, 
                newStatus: objective.status 
            }
        }, { transaction });
    }

    async unarchiveObjective(objectiveId, userId) {
        const transaction = await db.sequelize.transaction();
        try {
            const objective = await objectiveRepository.findById(objectiveId, userId, { transaction });
            if (!objective) throw new AppError('Objetivo no encontrado o no tienes permiso.', 404);
            if (objective.status !== 'ARCHIVED') throw new AppError('Este objetivo no está archivado.', 400);

            const newStatus = objective.previousStatus || 'PENDING';
            await objective.update({ status: newStatus, previousStatus: null }, { transaction });

            await ActivityLog.create({
                userId,
                objectiveId: objective.id,
                activityType: 'OBJECTIVE_UNARCHIVED',
                descriptionKey: 'activityLog.objectiveUnarchived',
                additionalDetails: { objectiveName: objective.name }
            }, { transaction });

            await transaction.commit();
            return this.getObjectiveById(objective.id, userId);

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Error al desarchivar el objetivo.', 500, error);
        }
    }

    async deleteObjective(objectiveId, userId) {
        const transaction = await db.sequelize.transaction();
        try {
            const objective = await objectiveRepository.findById(objectiveId, userId, { transaction });
            if (!objective) throw new AppError('Objetivo no encontrado.', 404);
            
            await ActivityLog.create({
                userId,
                objectiveId: objectiveId,
                activityType: 'OBJECTIVE_DELETED',
                descriptionKey: 'activityLog.objectiveDeleted',
                additionalDetails: { objectiveName: objective.name }
            }, { transaction });

            await objectiveRepository.delete(objectiveId, userId, { transaction });
            
            await transaction.commit();
            return { message: `Objetivo '${objective.name}' eliminado correctamente.` };

        } catch (error) {
            await transaction.rollback();
            if (error instanceof AppError) throw error;
            throw new AppError('Error al eliminar el objetivo.', 500, error);
        }
    }

    async userHasObjectives(userId) {
        const count = await Objective.count({ where: { userId } });
        return count > 0;
    }
}

const objectivesServiceInstance = new ObjectivesService();

module.exports = objectivesServiceInstance;
module.exports.calculateProgressPercentage = calculateProgressPercentage;