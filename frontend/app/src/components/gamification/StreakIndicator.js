import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaFire } from 'react-icons/fa';
import api from '../../services/apiService';

const StreakIndicator = ({ compact = false }) => {
    const [streak, setStreak] = useState(null);

    useEffect(() => {
        api.getStreak()
            .then(res => setStreak(res?.data?.streak))
            .catch(() => setStreak(null));
    }, []);

    if (!streak) return null;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: compact ? '0.25rem 0.6rem' : '0.5rem 1rem',
                borderRadius: '9999px',
                background: 'var(--warning-background-soft)',
                color: 'var(--warning-foreground-strong)',
                fontWeight: 600,
                fontSize: compact ? '0.8rem' : '0.9rem',
            }}
        >
            <FaFire />
            <span>{streak.currentStreak} días</span>
            {!compact && <span style={{ opacity: 0.7 }}>· Nivel {streak.level}</span>}
        </motion.div>
    );
};

export default StreakIndicator;
