// backend/src/api/repositories/activityLogRepository.js
const db = require('../../config/database');
const { ActivityLog } = db;

class ActivityLogRepository {
    async create(data, options = {}) {
        return ActivityLog.create(data, options);
    }

    async findRecentByUserId(userId, limit = 10, options = {}) {
        return ActivityLog.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            limit,
            ...options,
        });
    }
}

module.exports = new ActivityLogRepository();
