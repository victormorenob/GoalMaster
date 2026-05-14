/**
 * Repository for ActivityLog data operations.
 * Encapsulates all database access logic for the ActivityLog model.
 */
const db = require('../../config/database');

class ActivityLogRepository {
    constructor() {
        this.model = db.ActivityLog;
    }

    /**
     * Creates a new activity log entry.
     * @param {object} data - The activity log data.
     * @param {object} options - Query options (e.g., transaction).
     * @returns {Promise<ActivityLog>} The newly created activity log entry.
     */
    async create(data, options = {}) {
        return this.model.create(data, options);
    }

    /**
     * Finds all activity log entries for a user.
     * @param {number} userId - The ID of the user.
     * @param {object} options - Additional query options.
     * @returns {Promise<ActivityLog[]>} A list of activity log entries.
     */
    async findByUserId(userId, options = {}) {
        return this.model.findAll({ where: { userId }, ...options });
    }

    /**
     * Finds an activity log entry by its ID.
     * @param {number} id - The activity log entry ID.
     * @param {object} options - Additional query options.
     * @returns {Promise<ActivityLog|null>} The activity log entry or null.
     */
    async findById(id, options = {}) {
        return this.model.findByPk(id, options);
    }
}

module.exports = new ActivityLogRepository();
