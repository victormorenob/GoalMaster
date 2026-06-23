// @ts-nocheck
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import styles from './AuthLayout.module.css';

function AuthLayout() {
    const { t } = useTranslation();

    return (
        <div className={styles.authPage}>
            <motion.div
                className={styles.brandPanel}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ padding: '3rem', maxWidth: '28rem' }}>
                    <div style={{
                        width: '3.5rem', height: '3.5rem', borderRadius: '50%',
                        background: 'var(--primary)', color: 'var(--primary-foreground)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: '1.5rem', marginBottom: '1.5rem',
                    }}>G</div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', margin: '0 0 0.75rem', color: 'var(--foreground)' }}>
                        GoalMaster
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', lineHeight: 1.6, margin: 0 }}>
                        {t('auth.brandTagline', { defaultValue: 'Transforma tus aspiraciones en logros medibles con seguimiento visual, análisis y motivación.' })}
                    </p>
                </div>
            </motion.div>
            <main className={styles.mainContentArea}>
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ width: '100%', maxWidth: '32rem' }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
}

export default AuthLayout;
