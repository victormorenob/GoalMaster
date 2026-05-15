import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const statusFillClasses = {
    excellent: 'bg-[var(--success)]',
    good: 'bg-[var(--primary)]',
    regular: 'bg-[var(--warning)]',
    poor: 'bg-[var(--destructive)]',
};

const ProgressBar = ({ percentage }) => {
    const { t } = useTranslation();
    const clampedPercentage = Math.max(0, Math.min(100, parseFloat(percentage) || 0));

    const { statusText, StatusIcon, statusClass } = useMemo(() => {
        if (clampedPercentage >= 75) {
            return {
                statusText: t('progressBar.excellent'),
                StatusIcon: <FaChartLine className="inline-flex items-center mr-[0.4rem] text-[1.1em] text-[var(--success)]" />,
                statusClass: statusFillClasses.excellent,
            };
        }
        if (clampedPercentage >= 50) {
            return {
                statusText: t('progressBar.good'),
                StatusIcon: <FaChartLine className="inline-flex items-center mr-[0.4rem] text-[1.1em] text-[var(--success)]" />,
                statusClass: statusFillClasses.good,
            };
        }
        if (clampedPercentage >= 25) {
            return {
                statusText: t('progressBar.regular'),
                StatusIcon: <FaMinus className="inline-flex items-center mr-[0.4rem] text-[1.1em] text-[var(--warning)]" />,
                statusClass: statusFillClasses.regular,
            };
        }
        return {
            statusText: t('progressBar.poor'),
            StatusIcon: <FaArrowDown className="inline-flex items-center mr-[0.4rem] text-[1.1em] text-[var(--destructive)]" />,
            statusClass: statusFillClasses.poor,
        };
    }, [clampedPercentage, t]);

    return (
        <div className="w-full mt-3 mb-2">
            <div className="bg-[var(--muted)] rounded-[var(--radius)] h-3 relative overflow-hidden">
                <motion.div
                    className={`h-full block rounded-[var(--radius)] ${statusClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${clampedPercentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </div>
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-[0.3rem] px-[2px]">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
            {statusText && (
                <motion.div
                    className="mt-[0.6rem] text-sm text-[var(--foreground)] flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    {StatusIcon}
                    <span>{statusText}</span>
                </motion.div>
            )}
        </div>
    );
};

export default ProgressBar;
