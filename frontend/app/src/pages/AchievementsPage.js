// frontend/app/src/pages/AchievementsPage.js
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../services/apiService';
import AchievementList from '../components/gamification/AchievementList';
import LevelBadge from '../components/gamification/LevelBadge';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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

                // Count total progress entries from all objectives
                let totalProgressCount = 0;
                for (const obj of objectives) {
                    // If objectives have progressEntries included
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    {t('achievements.title', 'Achievements & Progress')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    {t('achievements.subtitle', 'Track your milestones and level up')}
                </p>
            </div>

            {/* Level & XP Section */}
            {statsData && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        {t('achievements.levelAndXP', 'Level & XP')}
                    </h2>
                    <LevelBadge stats={statsData} />
                </div>
            )}

            {/* Achievements Section */}
            <div>
                <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    {t('achievements.badges', 'Badges & Achievements')}
                </h2>
                <AchievementList userData={achievementData} />
            </div>
        </div>
    );
}

export default AchievementsPage;
