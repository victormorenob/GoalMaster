import React, { useMemo } from 'react';
import { FaChartLine, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const ProgressBar = ({ percentage }) => {
  const { t } = useTranslation();
  const clampedPercentage = Math.max(0, Math.min(100, parseFloat(percentage) || 0));

  const { statusText, StatusIcon, fillColor } = useMemo(() => {
    if (clampedPercentage >= 75) {
      return {
        statusText: t('progressBar.excellent'),
        StatusIcon: FaChartLine,
        fillColor: 'bg-emerald-500',
      };
    }
    if (clampedPercentage >= 50) {
      return {
        statusText: t('progressBar.good'),
        StatusIcon: FaChartLine,
        fillColor: 'bg-indigo-500',
      };
    }
    if (clampedPercentage >= 25) {
      return {
        statusText: t('progressBar.regular'),
        StatusIcon: FaMinus,
        fillColor: 'bg-amber-500',
      };
    }
    return {
      statusText: t('progressBar.poor'),
      StatusIcon: FaArrowDown,
      fillColor: 'bg-red-500',
    };
  }, [clampedPercentage, t]);

  return (
    <div className="w-full mt-3 mb-2">
      <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-3 relative overflow-hidden">
        <div
          className={`h-full rounded-lg transition-all duration-500 ease-in-out ${fillColor}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1 px-0.5">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      {statusText && (
        <div className="mt-1.5 text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <StatusIcon className={`text-sm ${
            clampedPercentage >= 50 ? 'text-emerald-500' :
            clampedPercentage >= 25 ? 'text-amber-500' : 'text-red-500'
          }`} />
          <span>{statusText}</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
