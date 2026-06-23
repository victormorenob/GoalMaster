import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const FullPageLoader = ({ message }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-slate-50/85 dark:bg-slate-900/85 backdrop-blur-sm">
      <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
        <LoadingSpinner size="large" text="" />
        {message && (
          <p className="mt-5 text-base font-medium text-slate-700 dark:text-slate-300">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default FullPageLoader;
