// frontend/app/src/components/gamification/StreakIndicator.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../../services/apiService';

const StreakIndicator = () => {
    const { t } = useTranslation();
    const [streakData, setStreakData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStreak = async () => {
            try {
                const response = await api.getStreak();
                const data = response?.data?.streak;
                if (data) {
                    setStreakData(data);
                }
            } catch (err) {
                console.warn('Could not fetch streak:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStreak();
    }, []);

    if (loading || !streakData) return null;

    return (
        <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.span
                className="text-2xl"
                role="img"
                aria-label="fire"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
                🔥
            </motion.span>
            <div className="flex flex-col">
                <motion.span
                    className="text-lg font-bold text-orange-600 dark:text-orange-400"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                >
                    {streakData.streakCount}
                </motion.span>
                <span className="text-xs text-orange-500 dark:text-orange-300">
                    {t('gamification.dayStreak', 'day streak!')}
                </span>
            </div>
            {streakData.longestStreak > streakData.streakCount && (
                <span className="text-xs text-gray-400 ml-2" title={t('gamification.longestStreak', 'Longest streak')}>
                    🏆 {streakData.longestStreak}
                </span>
            )}
        </motion.div>
    );
};

export default StreakIndicator;
