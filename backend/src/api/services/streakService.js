// backend/src/api/services/streakService.js
const db = require('../../config/database');
const AppError = require('../../utils/AppError');

const { User } = db;

class StreakService {
    async updateStreak(userId) {
        const user = await User.findByPk(userId);
        if (!user) throw new AppError('Usuario no encontrado.', 404);

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const lastActivityDate = user.lastActivityDate;
        let newStreakCount = user.streakCount || 0;
        let newLongestStreak = user.longestStreak || 0;

        if (!lastActivityDate) {
            newStreakCount = 1;
        } else {
            const lastDateStr = typeof lastActivityDate === 'string'
                ? lastActivityDate
                : lastActivityDate.toISOString().split('T')[0];

            if (lastDateStr === todayStr) {
                return { streakCount: user.streakCount, longestStreak: user.longestStreak, updated: false };
            }

            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            newStreakCount = lastDateStr === yesterdayStr ? (user.streakCount || 0) + 1 : 1;
        }

        newLongestStreak = Math.max(newLongestStreak, newStreakCount);
        await user.update({ streakCount: newStreakCount, longestStreak: newLongestStreak, lastActivityDate: todayStr });

        return { streakCount: newStreakCount, longestStreak: newLongestStreak, updated: true };
    }

    async getStreak(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['streakCount', 'longestStreak', 'lastActivityDate']
        });
        if (!user) throw new AppError('Usuario no encontrado.', 404);
        return user.toJSON();
    }
}

module.exports = new StreakService();
