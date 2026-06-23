import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import api from '../services/apiService';
import LevelBadge from '../components/gamification/LevelBadge';
import StreakIndicator from '../components/gamification/StreakIndicator';
import AchievementList from '../components/gamification/AchievementList';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { staggerContainer, fadeInUp } from '../utils/motion';

function AchievementsPage() {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [streak, setStreak] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        Promise.all([
            api.getStreak(),
            api.getUserProfileStats(),
        ]).then(([streakRes, statsRes]) => {
            setStreak(streakRes?.data?.streak);
            setStats(statsRes?.data);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <LoadingSpinner size="large" />;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="page-container">
            <motion.h2 variants={fadeInUp}>{t('achievementsPage.title', { defaultValue: 'Logros y progreso' })}</motion.h2>
            <motion.div variants={fadeInUp} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
                {streak && <LevelBadge level={streak.level} xpInLevel={streak.xpInLevel} xpToNextLevel={streak.xpToNextLevel} />}
                <StreakIndicator />
            </motion.div>
            {stats && (
                <motion.div variants={fadeInUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                    <div className="stat-card"><strong>{stats.totalObjectives}</strong><span>{t('achievementsPage.totalObjectives', { defaultValue: 'Objetivos' })}</span></div>
                    <div className="stat-card"><strong>{stats.completed}</strong><span>{t('achievementsPage.completed', { defaultValue: 'Completados' })}</span></div>
                    <div className="stat-card"><strong>{stats.successRate}%</strong><span>{t('achievementsPage.successRate', { defaultValue: 'Éxito' })}</span></div>
                </motion.div>
            )}
            <motion.div variants={fadeInUp}>
                <h3>{t('achievementsPage.badges', { defaultValue: 'Insignias' })}</h3>
                <AchievementList achievements={streak?.achievements || []} />
            </motion.div>
        </motion.div>
    );
}

export default AchievementsPage;
