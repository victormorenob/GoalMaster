import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-start min-h-[160px] text-left relative transition-shadow duration-200"
      whileHover={{ y: -3, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {icon && (
        <div className="text-2xl text-indigo-600 dark:text-indigo-400 mb-3 bg-indigo-50 dark:bg-indigo-900/30 w-10 h-10 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {title && (
          <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider m-0 mb-1">
            {title}
          </h3>
        )}
        {(typeof displayValue === 'string' || typeof displayValue === 'number') ? (
          <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 leading-tight m-0 mb-1">
            {displayValue}
          </p>
        ) : (
          value
        )}
        {valueDescription && (
          <span className="text-xs text-slate-400 dark:text-slate-500 block mb-2">
            {valueDescription}
          </span>
        )}
        {details && !children && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
            {details}
          </p>
        )}

        {children && (
          <div className="mt-auto pt-2 flex-1 relative w-full flex flex-col justify-end min-h-[150px]">
            {children}
          </div>
        )}
      </div>

      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 no-underline mt-auto pt-3 inline-flex items-center gap-1 hover:text-indigo-500 transition-colors"
        >
          {linkText || t('statsCard.viewDetails')} <FaArrowRight size="0.8em" />
        </Link>
      )}
    </motion.div>
  );
};

export default StatsCard;
