/**
 * Repository for Progress data operations.
 * Encapsulates all database access logic for the Progress model.
 */
const db = require('../../config/database');

class ProgressRepository {
    constructor() {
        this.model = db.Progress;
    }

    /**
     * Creates a new progress entry.
     * @param {object} data - The progress entry data.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<Progress>} The newly created progress entry.
     */
    async create(data, options = {}) {
        return this.model.create(data, options);
    }

    /**
     * Finds all progress entries for an objective belonging to a user.
     * @param {number} objectiveId - The ID of the objective.
     * @param {number} userId - The ID of the user.
     * @param {object} options - Additional query options.
     * @returns {Promise<Progress[]>} A list of progress entries.
     */
    async findByObjectiveId(objectiveId, userId, options = {}) {
        return this.model.findAll({ where: { objectiveId, userId }, ...options });
    }

    /**
     * Finds a progress entry by its ID.
     * @param {number} id - The progress entry ID.
     * @param {object} options - Additional query options.
     * @returns {Promise<Progress|null>} The progress entry or null.
     */
    async findById(id, options = {}) {
        return this.model.findByPk(id, options);
    }

    /**
     * Deletes a progress entry by its ID.
     * @param {number} id - The progress entry ID.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<number>} The number of deleted rows.
     */
    async delete(id, options = {}) {
        return this.model.destroy({ where: { id }, ...options });
    }
}

module.exports = new ProgressRepository();
