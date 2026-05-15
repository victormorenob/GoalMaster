import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const StatsCard = ({
    title,
    value,
    valueDescription,
    details,
    linkTo,
    icon,
    linkText,
    children,
    decimalPlacesToShow,
}) => {
    const { t } = useTranslation();
    let displayValue = value;

    if (typeof value === 'number' && decimalPlacesToShow !== undefined && decimalPlacesToShow !== null) {
        const places = Math.max(0, Math.floor(decimalPlacesToShow));
        displayValue = value.toFixed(places);
    }

    return (
        <motion.div
            className="bg-[var(--card)] rounded-[var(--radius-md,8px)] p-5 shadow-[var(--shadow-sm)] border border-[var(--border)] flex flex-col justify-start min-h-[160px] text-left relative"
            whileHover={{ y: -2, boxShadow: 'var(--shadow-md)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {icon && <div className="text-[1.8rem] text-[var(--primary)] mb-3 bg-[color-mix(in_srgb,var(--primary)_15%,transparent)] w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center">{icon}</div>}

            <div className="flex-grow flex flex-col">
                {title && <h3 className="text-xs font-medium text-[var(--muted-foreground)] m-0 mb-[0.35rem] uppercase tracking-[0.05em]">{title}</h3>}
                {(typeof displayValue === 'string' || typeof displayValue === 'number') ? (
                    <p className="text-3xl font-bold text-[var(--foreground)] leading-tight m-0 mb-1">{displayValue}</p>
                ) : (
                    value
                )}
                {valueDescription && <span className="text-xs text-[var(--muted-foreground)] mt-0 mb-2 block">{valueDescription}</span>}
                {details && !children && <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-normal">{details}</p>}

                {children && <div className="mt-auto pt-2 flex-grow relative w-full min-h-[150px] flex flex-col justify-end">{children}</div>}
            </div>

            {linkTo && (
                <Link to={linkTo} className="text-xs font-semibold text-[var(--primary)] no-underline mt-auto pt-3 inline-flex items-center gap-[0.3rem] hover:text-[var(--primary-hover)]">
                    {linkText || t('statsCard.viewDetails')} <FaArrowRight size="0.8em" />
                </Link>
            )}
        </motion.div>
    );
};

export default StatsCard;
