import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const AchievementList = ({ achievements = [] }) => {
    const { t } = useTranslation();

    if (!achievements.length) {
        return (
            <div className="empty-state-card">
                <p>{t('achievements.empty', { defaultValue: 'Completa objetivos para desbloquear logros.' })}</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
            {achievements.map((a, i) => (
                <motion.div
                    key={a.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        background: a.unlocked ? 'var(--success-soft-bg)' : 'var(--muted)',
                        opacity: a.unlocked ? 1 : 0.6,
                    }}
                >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{a.unlocked ? '🏆' : '🔒'}</div>
                    <strong>{t(a.titleKey, { defaultValue: a.id })}</strong>
                </motion.div>
            ))}
        </div>
    );
};

export default AchievementList;
