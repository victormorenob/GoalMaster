// backend/src/api/repositories/progressRepository.js
const db = require('../../config/database');
const { Progress } = db;

class ProgressRepository {
    async create(data, options = {}) {
        return Progress.create(data, options);
    }

    async findByObjectiveId(objectiveId, options = {}) {
        return Progress.findAll({
            where: { objectiveId },
            order: [['entryDate', 'ASC']],
            ...options,
        });
    }

    async deleteByObjectiveId(objectiveId, options = {}) {
        return Progress.destroy({ where: { objectiveId }, ...options });
    }
}

module.exports = new ProgressRepository();
