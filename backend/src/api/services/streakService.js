// backend/src/api/services/streakService.js
const db = require('../../config/database');
const AppError = require('../../utils/AppError');

const { User } = db;

class StreakService {

    /**
     * Updates a user's streak when they log progress.
     * If lastActivityDate was yesterday, increment streakCount.
     * If today, no change.
     * If older than yesterday, reset to 1.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<object>} Updated streak information.
     */
    async updateStreak(userId) {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        const lastActivityDate = user.lastActivityDate;
        let newStreakCount = user.streakCount || 0;
        let newLongestStreak = user.longestStreak || 0;

        if (!lastActivityDate) {
            // First activity ever
            newStreakCount = 1;
        } else {
            const lastDateStr = typeof lastActivityDate === 'string'
                ? lastActivityDate
                : lastActivityDate.toISOString().split('T')[0];

            if (lastDateStr === todayStr) {
                // Already logged today — no change
                return {
                    streakCount: user.streakCount,
                    longestStreak: user.longestStreak,
                    updated: false
                };
            }

            // Check if last activity was yesterday
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastDateStr === yesterdayStr) {
                // Consecutive day — increment
                newStreakCount = (user.streakCount || 0) + 1;
            } else {
                // Streak broken — reset
                newStreakCount = 1;
            }
        }

        // Update longest streak if current streak exceeds it
        newLongestStreak = Math.max(newLongestStreak, newStreakCount);

        await user.update({
            streakCount: newStreakCount,
            longestStreak: newLongestStreak,
            lastActivityDate: todayStr
        });

        return {
            streakCount: newStreakCount,
            longestStreak: newLongestStreak,
            updated: true
        };
    }

    /**
     * Returns current streak info for a user.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<object>} Current streak data.
     */
    async getStreak(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['streakCount', 'longestStreak', 'lastActivityDate']
        });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        return user.toJSON();
    }

    /**
     * Returns the longest recorded streak for a user.
     * @param {number} userId - The ID of the user.
     * @returns {Promise<number>} The longest streak count.
     */
    async getLongestStreak(userId) {
        const user = await User.findByPk(userId, {
            attributes: ['longestStreak']
        });
        if (!user) {
            throw new AppError('Usuario no encontrado.', 404);
        }
        return user.longestStreak;
    }
}

const streakServiceInstance = new StreakService();
module.exports = streakServiceInstance;
