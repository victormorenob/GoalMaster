import React from 'react';
import { useTranslation } from 'react-i18next';

const sizeMap = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-[4px]',
};

const colorMap = {
  primary: 'border-indigo-600 border-t-indigo-300',
  white: 'border-white border-t-white/40',
  secondary: 'border-emerald-600 border-t-emerald-300',
  text: 'border-slate-700 dark:border-slate-300 border-t-slate-400',
};

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  style = {},
  text,
}) => {
  const { t } = useTranslation();
  const sizeClass = sizeMap[size] || sizeMap.md;
  const colorClass = colorMap[color] || colorMap.primary;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} style={style}>
      <div
        className={`rounded-full animate-spin ${sizeClass} ${colorClass}`}
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">{t('loaders.loadingSimple')}</span>
      </div>
      {text && (
        <span className="text-sm text-slate-500 dark:text-slate-400">{text}</span>
      )}
    </div>
  );
};

export default LoadingSpinner;
