import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const sizeClasses = {
    small: 'w-4 h-4 border-2',
    medium: 'w-8 h-8 border-4',
    large: 'w-12 h-12 border-5',
};

const colorClasses = {
    primary: 'border-[var(--primary)] border-t-[var(--primary)]/50',
    white: 'border-white border-t-white/40',
    secondary: 'border-[var(--secondary)] border-t-[var(--secondary)]/50',
    text: 'border-[var(--foreground)] border-t-[var(--muted-foreground,#ccc)]',
};

const LoadingSpinner = ({
    size = 'medium',
    color = 'primary',
    className = '',
    style = {},
    text
}) => {
    const { t } = useTranslation();
    const sizeClass = sizeClasses[size] || sizeClasses.medium;
    const colorClass = colorClasses[color] || colorClasses.primary;

    return (
        <motion.div
            className={`inline-flex items-center gap-2 ${className}`}
            style={style}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className={`border-solid rounded-full inline-block ${sizeClass} ${colorClass}`}
                role="status"
                aria-live="polite"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
                <span className="sr-only">{t('loaders.loadingSimple')}</span>
            </motion.div>
            {text && <span className="text-sm text-[var(--muted-foreground,#555)]">{text}</span>}
        </motion.div>
    );
};

export default LoadingSpinner;
