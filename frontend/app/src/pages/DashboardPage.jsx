// frontend/app/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/apiService';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import StatsCard from '../components/objetivos/StatsCard';
import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import RecentObjectivesList from '../components/objetivos/RecentObjectivesList';
import RecentActivityFeed from '../components/objetivos/RecentActivityFeed';
import ProgressBar from '../components/ui/ProgressBar';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';

const CATEGORY_MAP = {
  HEALTH: 'categories.health',
  FINANCE: 'categories.finance',
  PERSONAL_DEV: 'categories.personalDevelopment',
  RELATIONSHIPS: 'categories.relationships',
  CAREER: 'categories.career',
  OTHER: 'categories.other',
};

const STATUS_MAP = {
  IN_PROGRESS: { key: 'status.inProgress', color: 'var(--info)' },
  PENDING: { key: 'status.pending', color: 'var(--warning)' },
  COMPLETED: { key: 'status.completed', color: 'var(--success)' },
  FAILED: { key: 'status.failed', color: 'var(--destructive)' },
  ARCHIVED: { key: 'status.archived', color: 'var(--muted-foreground)' },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [summaryData, setSummaryData] = useState(null);
  const [recentObjectives, setRecentObjectives] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasBeenRedirectedRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, objectivesRes, activitiesRes] = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getRecentObjectives(4),
        api.getRecentActivities(5),
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value.data) {
        const summary = summaryRes.value.data;
        setSummaryData(summary);
        if (summary.totalObjectives === 0 && !hasBeenRedirectedRef.current) {
          hasBeenRedirectedRef.current = true;
          toast.info(t('toast.welcomeCreateFirst'));
          navigate('/objectives/new', { replace: true });
          return;
        }
      } else {
        throw summaryRes.reason || new Error('No se pudo cargar el resumen');
      }

      if (objectivesRes.status === 'fulfilled')
        setRecentObjectives(objectivesRes.value.data || []);
      if (activitiesRes.status === 'fulfilled')
        setRecentActivities(activitiesRes.value.data || []);
    } catch (err) {
      const errorMessage =
        err?.message ||
        (typeof err === 'string' ? err : t('toast.dashboardLoadError'));
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [navigate, t]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const categoryChartData = useMemo(() => {
    if (!summaryData?.categories) return [];
    return summaryData.categories.map((item) => ({
      name: t(CATEGORY_MAP[item.category] || item.category),
      value: item.count,
    }));
  }, [summaryData, t]);

  const renderStatusList = () => (
    <ul className="list-none p-0 m-0 mt-3 text-xs">
      {Object.entries(summaryData.statusCounts || {}).map(([status, count]) => {
        const statusInfo = STATUS_MAP[status];
        if (!statusInfo || count === 0) return null;
        return (
          <li key={status} className="flex items-center justify-between py-1">
            <span
              className="w-2 h-2 rounded-full inline-block mr-2 shrink-0"
              style={{ backgroundColor: statusInfo.color }}
            />
            <span className="flex-1 text-slate-400 dark:text-slate-500">
              {t(statusInfo.key, status)}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 min-w-[20px] text-right">
              {count}
            </span>
          </li>
        );
      })}
    </ul>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <LoadingSpinner size="large" text={t('loaders.loadingDashboard')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-red-500 mb-6 text-base">
          {t('common.errorPrefix', { error })}
        </p>
        <Button onClick={fetchDashboardData} variant="secondary">
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <motion.div
      className="flex flex-col gap-6 h-full overflow-hidden box-border"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats cards grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <motion.div variants={itemVariants}>
          <StatsCard
            title={t('dashboard.stats.totalObjectives')}
            value={String(summaryData.totalObjectives)}
            linkTo="/my-objectives"
          >
            {summaryData.totalObjectives > 0
              ? renderStatusList()
              : (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                  {t('dashboard.stats.noObjectives')}
                </p>
              )}
          </StatsCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title={t('dashboard.stats.averageProgress')}
            value={summaryData.averageProgress}
            valueDescription="%"
            decimalPlacesToShow={0}
          >
            <ProgressBar percentage={summaryData.averageProgress} />
          </StatsCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard
            title={t('dashboard.stats.dueSoon')}
            value={String(summaryData.dueSoonCount)}
            valueDescription={t('dashboard.stats.objectives')}
            details={t('dashboard.stats.dueSoonDetails')}
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <StatsCard title={t('dashboard.stats.categories')} linkTo="/analysis">
            <CategoryDonutChart data={categoryChartData} />
          </StatsCard>
        </motion.div>
      </section>

      {/* Bottom sections */}
      <section className="grid grid-cols-1 lg:grid-cols-[2.2fr_1.8fr] gap-6 flex-1 min-h-0 overflow-hidden">
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-y-auto min-h-0 shadow-sm"
          variants={itemVariants}
        >
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 m-0 mb-4">
            {t('dashboard.sections.keyObjectives')}
          </h3>
          <RecentObjectivesList objectives={recentObjectives} />
        </motion.div>

        <motion.div
          className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 flex flex-col overflow-y-auto min-h-0 shadow-sm"
          variants={itemVariants}
        >
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 m-0 mb-4">
            {t('dashboard.sections.recentActivity')}
          </h3>
          <RecentActivityFeed activities={recentActivities} />
        </motion.div>
      </section>
    </motion.div>
  );
}

export default DashboardPage;
