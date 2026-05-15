// frontend/app/src/components/gamification/LevelBadge.jsx
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

const LEVEL_THRESHOLDS = [
    { level: 1, minXP: 0, maxXP: 499, color: 'from-gray-400 to-gray-300', textColor: 'text-gray-700' },
    { level: 2, minXP: 500, maxXP: 1499, color: 'from-green-400 to-emerald-300', textColor: 'text-green-800' },
    { level: 3, minXP: 1500, maxXP: 2999, color: 'from-blue-400 to-cyan-300', textColor: 'text-blue-800' },
    { level: 4, minXP: 3000, maxXP: 4999, color: 'from-purple-400 to-violet-300', textColor: 'text-purple-800' },
    { level: 5, minXP: 5000, maxXP: Infinity, color: 'from-yellow-400 to-amber-300', textColor: 'text-yellow-800' },
];

/**
 * Calculate XP from user data.
 * @param {object} stats - User stats object with objectives, progress, streak data.
 * @returns {number} Total XP.
 */
export const calculateXP = (stats) => {
    let xp = 0;
    // 100 XP per objective completed
    if (stats?.completedObjectives) {
        xp += stats.completedObjectives * 100;
    }
    // 50 XP per streak day
    if (stats?.streakCount) {
        xp += stats.streakCount * 50;
    }
    // 200 XP per achievement (placeholder — actual achievements calculated elsewhere)
    if (stats?.achievementsCount) {
        xp += stats.achievementsCount * 200;
    }
    return xp;
};

/**
 * Get level info for a given XP amount.
 * @param {number} xp - Total XP.
 * @returns {{ level: number, currentLevelXP: number, nextLevelXP: number, progress: number, color: string, textColor: string }}
 */
export const getLevelInfo = (xp) => {
    const currentLevel = LEVEL_THRESHOLDS.find(l => xp >= l.minXP && xp <= l.maxXP) || LEVEL_THRESHOLDS[0];
    const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === currentLevel.level + 1);

    const currentLevelMin = currentLevel.minXP;
    const currentLevelMax = currentLevel.maxXP;
    const levelRange = currentLevelMax - currentLevelMin;
    const progress = levelRange > 0 ? Math.min(100, ((xp - currentLevelMin) / levelRange) * 100) : 100;

    return {
        level: currentLevel.level,
        currentLevelXP: currentLevel.minXP,
        nextLevelXP: currentLevel.maxXP === Infinity ? currentLevel.minXP : currentLevel.maxXP,
        progress: Math.round(progress),
        color: currentLevel.color,
        textColor: currentLevel.textColor,
        isMaxLevel: currentLevel.maxXP === Infinity,
    };
};

const LevelBadge = ({ stats, compact = false }) => {
    const { t } = useTranslation();

    const xp = useMemo(() => calculateXP(stats), [stats]);
    const levelInfo = useMemo(() => getLevelInfo(xp), [xp]);

    if (compact) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${levelInfo.color} flex items-center justify-center font-bold text-sm ${levelInfo.textColor}`}>
                    {levelInfo.level}
                </div>
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                        {t('gamification.level', 'Level')} {levelInfo.level}
                    </span>
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full transition-all duration-300"
                            style={{ width: `${levelInfo.progress}%` }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-gradient-to-br ${levelInfo.color} rounded-xl p-4 shadow-sm`}>
            <div className="flex items-center justify-between">
                <div>
                    <span className={`text-sm font-medium ${levelInfo.textColor} opacity-80`}>
                        {t('gamification.level', 'Level')}
                    </span>
                    <span className={`text-3xl font-bold block ${levelInfo.textColor}`}>
                        {levelInfo.level}
                    </span>
                </div>
                <div className={`text-right ${levelInfo.textColor}`}>
                    <span className="text-lg font-bold">{xp.toLocaleString()}</span>
                    <span className="text-sm opacity-80 block">XP</span>
                </div>
            </div>
            {!levelInfo.isMaxLevel && (
                <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                        <span>{xp.toLocaleString()} XP</span>
                        <span>{levelInfo.nextLevelXP.toLocaleString()} XP</span>
                    </div>
                    <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/70 rounded-full transition-all duration-300"
                            style={{ width: `${levelInfo.progress}%` }}
                        />
                    </div>
                    <p className="text-xs mt-1 opacity-80">
                        {levelInfo.nextLevelXP - xp} XP {t('gamification.toNextLevel', 'to next level')}
                    </p>
                </div>
            )}
        </div>
    );
};

LevelBadge.propTypes = {
    stats: PropTypes.shape({
        completedObjectives: PropTypes.number,
        streakCount: PropTypes.number,
        achievementsCount: PropTypes.number,
    }),
    compact: PropTypes.bool,
};

export default LevelBadge;
