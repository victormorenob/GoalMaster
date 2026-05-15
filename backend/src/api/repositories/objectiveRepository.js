// backend/src/api/repositories/objectiveRepository.js
const { Op } = require('sequelize');
const db = require('../../config/database');

/**
 * Repository for Objective data operations.
 * Encapsulates all database access logic for the Objective model.
 */
class ObjectiveRepository {
    constructor() {
        this.model = db.Objective; // Usa el modelo refactorizado
    }

    /**
     * Finds all objectives for a user, with optional filtering and sorting.
     * @param {number} userId - The ID of the user.
     * @param {object} filters - An object containing filter criteria.
     * @returns {Promise<Objective[]>} A list of objective instances.
     */
    async findAll(userId, filters = {}) {
        const whereClause = { userId };

        // Filter to include or exclude archived objectives
        if (String(filters.includeArchived).toLowerCase() !== 'true') {
            whereClause.status = { [Op.not]: 'ARCHIVED' };
        }
        
        // Filter by category
        if (filters.category && filters.category !== 'all') {
            whereClause.category = filters.category;
        }

        // Filter by search term in name, description, or tags
        if (filters.searchTerm) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${filters.searchTerm}%` } },
                { description: { [Op.like]: `%${filters.searchTerm}%` } },
                { tags: { [Op.like]: `%${filters.searchTerm}%` } }
            ];
        }
        
        // Sorting logic based on database fields
        let orderClause = [['updatedAt', 'DESC']]; // Default sort order
        const sortByMapping = {
            recent: [['updatedAt', 'DESC']],
            oldest: [['updatedAt', 'ASC']],
            nameAsc: [['name', 'ASC']],
            nameDesc: [['name', 'DESC']],
            dateAsc: [['endDate', 'ASC']],
        };
        if (filters.sortBy && sortByMapping[filters.sortBy]) {
            orderClause = sortByMapping[filters.sortBy];
        }
        // Note: Sorting by calculated progress is handled in the service layer.

        return this.model.findAll({ 
            where: whereClause,
            order: orderClause
        });
    }

    /**
     * Finds a single objective by its ID and user ID.
     * @param {number} objectiveId - The ID of the objective.
     * @param {number} userId - The ID of the user who owns the objective.
     * @param {object} options - Additional options for the query (e.g., includes).
     * @returns {Promise<Objective|null>} The objective instance or null if not found.
     */
    async findById(objectiveId, userId, options = {}) {
        return this.model.findOne({
            where: { id: objectiveId, userId: userId },
            ...options
        });
    }

    /**
     * Creates a new objective.
     * @param {object} objectiveData - The data for the new objective.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<Objective>} The newly created objective instance.
     */
    async create(objectiveData, options = {}) {
        return this.model.create(objectiveData, options);
    }

    /**
     * Updates an objective.
     * @param {number} objectiveId - The ID of the objective to update.
     * @param {number} userId - The ID of the user.
     * @param {object} updatedData - The new data for the objective.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<number>} The number of updated rows.
     */
    async update(objectiveId, userId, updatedData, options = {}) {
        const [updatedRows] = await this.model.update(updatedData, {
            where: { id: objectiveId, userId: userId },
            ...options
        });
        return updatedRows;
    }

    /**
     * Deletes an objective.
     * @param {number} objectiveId - The ID of the objective to delete.
     * @param {number} userId - The ID of the user.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<number>} The number of deleted rows.
     */
    async delete(objectiveId, userId, options = {}) {
        return this.model.destroy({
            where: { id: objectiveId, userId: userId },
            ...options
        });
    }
}

module.exports = new ObjectiveRepository();