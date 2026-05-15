// frontend/app/src/pages/AchievementsPage.js
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import api from '../services/apiService';
import AchievementList from '../components/gamification/AchievementList';
import LevelBadge from '../components/gamification/LevelBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function AchievementsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [achievementData, setAchievementData] = useState(null);
    const [statsData, setStatsData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [objectivesRes, streakRes, profileStatsRes] = await Promise.allSettled([
                    api.getObjectives({ includeArchived: true }),
                    api.getStreak(),
                    api.getUserProfileStats(),
                ]);

                const objectives = objectivesRes.status === 'fulfilled'
                    ? (objectivesRes.value?.data?.objectives || [])
                    : [];
                const streakData = streakRes.status === 'fulfilled'
                    ? streakRes.value?.data?.streak
                    : null;
                const profileStats = profileStatsRes.status === 'fulfilled'
                    ? profileStatsRes.value?.data
                    : null;

                let totalProgressCount = 0;
                for (const obj of objectives) {
                    if (obj.progressEntries) {
                        totalProgressCount += obj.progressEntries.length;
                    }
                }

                setAchievementData({
                    objectives,
                    progressCount: profileStats?.totalProgressEntries || totalProgressCount || 0,
                    streakCount: streakData?.streakCount || 0,
                    analysisVisits: parseInt(localStorage.getItem('goalmaster_analysis_visits') || '0', 10),
                });

                setStatsData({
                    completedObjectives: profileStats?.completed || 0,
                    streakCount: streakData?.streakCount || 0,
                    achievementsCount: 0,
                });
            } catch (err) {
                console.error('Error fetching achievement data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <LoadingSpinner size="large" text={t('loaders.loading', 'Loading...')} />
            </div>
        );
    }

    return (
        <motion.div
            className="max-w-4xl mx-auto p-4 sm:p-6"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.div className="mb-6" variants={sectionVariants}>
                <h1 className="text-2xl font-bold text-[var(--foreground)]">
                    {t('achievements.title', 'Achievements & Progress')}
                </h1>
                <p className="text-[var(--muted-foreground)] mt-1">
                    {t('achievements.subtitle', 'Track your milestones and level up')}
                </p>
            </motion.div>

            {/* Level & XP Section */}
            {statsData && (
                <motion.div className="mb-8" variants={sectionVariants}>
                    <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                        {t('achievements.levelAndXP', 'Level & XP')}
                    </h2>
                    <LevelBadge stats={statsData} />
                </motion.div>
            )}

            {/* Achievements Section */}
            <motion.div variants={sectionVariants}>
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-3">
                    {t('achievements.badges', 'Badges & Achievements')}
                </h2>
                <AchievementList userData={achievementData} />
            </motion.div>
        </motion.div>
    );
}

export default AchievementsPage;
