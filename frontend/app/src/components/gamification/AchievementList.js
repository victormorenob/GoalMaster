// frontend/app/src/components/gamification/AchievementList.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const ACHIEVEMENT_DEFINITIONS = [
    { id: 'FIRST_GOAL', name: 'First Goal', description: 'Create your first objective', icon: '🥇' },
    { id: 'STREAK_3', name: 'Getting Started', description: '3-day streak', icon: '🔥' },
    { id: 'STREAK_7', name: 'One Week', description: '7-day streak', icon: '🔥' },
    { id: 'STREAK_30', name: 'Unstoppable', description: '30-day streak', icon: '🔥' },
    { id: 'CATEGORY_COMPLETE', name: 'Category Master', description: 'Complete an objective in each category', icon: '🏆' },
    { id: 'PROGRESS_10', name: 'Dedicated', description: 'Log 10 progress entries', icon: '📊' },
    { id: 'PROGRESS_50', name: 'Committed', description: 'Log 50 progress entries', icon: '📊' },
    { id: 'ANALYZER', name: 'Data Lover', description: 'Visit Analysis page 10 times', icon: '📈' },
];

/**
 * Check which achievements are earned based on user data.
 * @param {object} userData - User data with objectives, progress, streak, etc.
 * @returns {Array<{id: string, earned: boolean}>}
 */
export const checkAchievements = (userData) => {
    if (!userData) return ACHIEVEMENT_DEFINITIONS.map(a => ({ ...a, earned: false }));

    const { objectives = [], progressCount = 0, streakCount = 0, completedCategories = [], analysisVisits = 0 } = userData;
    const completedObjectives = objectives.filter(o => o.status === 'COMPLETED');

    const earnedMap = {};

    // FIRST_GOAL: created at least one objective
    earnedMap.FIRST_GOAL = objectives.length > 0;

    // STREAK_3/7/30: streak milestones
    earnedMap.STREAK_3 = streakCount >= 3;
    earnedMap.STREAK_7 = streakCount >= 7;
    earnedMap.STREAK_30 = streakCount >= 30;

    // CATEGORY_COMPLETE: completed an objective in each category
    const categories = ['HEALTH', 'FINANCE', 'PERSONAL_DEV', 'RELATIONSHIPS', 'CAREER'];
    const completedCategorySet = new Set(completedObjectives.map(o => o.category));
    earnedMap.CATEGORY_COMPLETE = categories.every(cat => completedCategorySet.has(cat));

    // PROGRESS_10/50: total progress entries
    earnedMap.PROGRESS_10 = progressCount >= 10;
    earnedMap.PROGRESS_50 = progressCount >= 50;

    // ANALYZER: visit analysis page 10 times (from localStorage or prop)
    earnedMap.ANALYZER = analysisVisits >= 10;

    return ACHIEVEMENT_DEFINITIONS.map(a => ({
        ...a,
        earned: !!earnedMap[a.id],
    }));
};

const AchievementList = ({ userData, compact = false }) => {
    const { t } = useTranslation();

    const achievements = useMemo(() => checkAchievements(userData), [userData]);
    const earnedCount = useMemo(() => achievements.filter(a => a.earned).length, [achievements]);

    if (compact) {
        return (
            <div className="px-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {t('gamification.achievements', 'Achievements')}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({earnedCount}/{achievements.length})
                    </span>
                </div>
                <div className="flex flex-wrap gap-1">
                    {achievements.slice(0, 5).map(a => (
                        <span
                            key={a.id}
                            className={`text-lg ${a.earned ? 'opacity-100' : 'opacity-30 grayscale'}`}
                            title={a.earned ? a.name : '???'}
                        >
                            {a.icon}
                        </span>
                    ))}
                    {achievements.length > 5 && (
                        <span className="text-xs text-gray-400 self-center">
                            +{achievements.length - 5}
                        </span>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {achievements.map(a => (
                <div
                    key={a.id}
                    className={`
                        relative rounded-lg p-3 border-2 transition-all duration-200
                        ${a.earned
                            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'
                        }
                    `}
                >
                    <div className="text-3xl mb-1 text-center">{a.icon}</div>
                    <h4 className={`text-sm font-bold text-center ${a.earned ? 'text-amber-800 dark:text-amber-200' : 'text-gray-400 dark:text-gray-500'}`}>
                        {a.earned ? a.name : '???'}
                    </h4>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-1">
                        {a.earned ? a.description : t('gamification.locked', 'Locked')}
                    </p>
                    {a.earned && (
                        <div className="absolute top-1 right-1 text-xs">✅</div>
                    )}
                </div>
            ))}
        </div>
    );
};

AchievementList.propTypes = {
    userData: PropTypes.object,
    compact: PropTypes.bool,
};

export default AchievementList;
