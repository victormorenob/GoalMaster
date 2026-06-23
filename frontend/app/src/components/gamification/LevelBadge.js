import React from 'react';
import { motion } from 'framer-motion';

const LevelBadge = ({ level = 1, xpInLevel = 0, xpToNextLevel = 100 }) => {
    const pct = xpToNextLevel > 0 ? Math.min(100, (xpInLevel / xpToNextLevel) * 100) : 0;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
                padding: '1rem',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary-soft-bg), var(--card))',
                border: '1px solid var(--border)',
            }}
        >
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>Nv. {level}</div>
            <div style={{ marginTop: '0.5rem', height: '6px', borderRadius: '9999px', background: 'var(--muted)', overflow: 'hidden' }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8 }}
                    style={{ height: '100%', background: 'var(--primary)', borderRadius: '9999px' }}
                />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.35rem' }}>{xpInLevel} / {xpToNextLevel} XP</p>
        </motion.div>
    );
};

export default LevelBadge;
