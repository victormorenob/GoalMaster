import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/apiService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import StatsCard from '../components/objetivos/StatsCard';
import { useTranslation } from 'react-i18next';

import CategoryDonutChart from '../components/charts/CategoryDonutChart';
import ObjectiveStatusChart from '../components/charts/ObjectiveStatusChart';
import MonthlyProgressChart from '../components/charts/MonthlyProgressChart';
import ObjectiveProgressBarChart from '../components/charts/ObjectiveProgressBarChart';
import CategoryAverageProgressBarChart from '../components/charts/CategoryAverageProgressBarChart';
import RankedObjectivesList from '../components/analysis/RankedObjectivesList';
import CategoryObjectivesCard from '../components/analysis/CategoryObjectivesCard';

const categoryNameToKeyMap = {
    'HEALTH': 'categories.health', 'FINANCE': 'categories.finance',
    'PERSONAL_DEV': 'categories.personalDevelopment', 'RELATIONSHIPS': 'categories.relationships',
    'CAREER': 'categories.career', 'OTHER': 'categories.other'
};

const statusNameToKeyMap = {
    'IN_PROGRESS': 'status.inProgress', 'COMPLETED': 'status.completed',
    'PENDING': 'status.pending', 'FAILED': 'status.failed',
    'ARCHIVED': 'status.archived',
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const panelVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function AnalysisPage() {
    const { t } = useTranslation();

    const [summaryStats, setSummaryStats] = useState({
        totalObjectives: 0, activeObjectives: 0, completedObjectives: 0,
        averageProgress: 0, categoryCount: 0, categories: [],
        trend: { type: 'neutral', textKey: 'analysis.trends.stable' }
    });

    const [rawCategoryDistribution, setRawCategoryDistribution] = useState([]);
    const [rawObjectiveStatus, setRawObjectiveStatus] = useState([]);

    const [rawMonthlyProgress, setRawMonthlyProgress] = useState({ labels: [], datasets: [] });

    const [rawObjectivesProgressData, setRawObjectivesProgressData] = useState([]);
    const [topProgressObjectives, setTopProgressObjectives] = useState([]);
    const [lowProgressObjectives, setLowProgressObjectives] = useState([]);
    const [rawCategoryAverageProgress, setRawCategoryAverageProgress] = useState([]);
    const [detailedObjectivesByCategory, setDetailedObjectivesByCategory] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timePeriod, setTimePeriod] = useState('3months');
    const [activeTab, setActiveTab] = useState('general');

    const timePeriodOptions = useMemo(() => [
        { value: '1month', key: 'analysis.timePeriods.1month' },
        { value: '3months', key: 'analysis.timePeriods.3months' },
        { value: '6months', key: 'analysis.timePeriods.6months' },
        { value: '1year', key: 'analysis.timePeriods.1year' },
        { value: 'all', key: 'analysis.timePeriods.all' },
    ], []);

    const categoryColorsRef = useRef({});

    const getCategoryColor = useCallback((categoryName, index, allCategoriesSource) => {
        const allCategories = allCategoriesSource || summaryStats.categories || [];
        if (!categoryName) return '#cccccc';
        if (categoryColorsRef.current[categoryName] && allCategories.some(c => c.name === categoryName)) {
            return categoryColorsRef.current[categoryName];
        }
        const baseColors = ['#4F46E5', '#10B981', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#6366F1', '#22D3EE'];
        const catIndex = allCategories.findIndex(c => c.name === categoryName);
        const color = baseColors[(catIndex !== -1 ? catIndex : index) % baseColors.length];
        if (categoryName) {
            categoryColorsRef.current[categoryName] = color;
        }
        return color;
    }, [summaryStats.categories]);

    const getStatusColorForChart = useCallback((statusName) => {
        const statusColorMap = {
            'IN_PROGRESS': 'rgba(54, 162, 235, 0.8)', 'COMPLETED': 'rgba(75, 192, 192, 0.8)',
            'PENDING': 'rgba(255, 206, 86, 0.8)', 'FAILED': 'rgba(255, 99, 132, 0.8)',
            'ARCHIVED': 'rgba(153, 102, 255, 0.8)',
        };
        return statusColorMap[statusName] || 'rgba(201, 203, 207, 0.8)';
    }, []);

    const fetchAllGeneralDataAPI = useCallback(async (period) => {
        const params = { period };
        return Promise.allSettled([
            api.getCategoryDistribution(params), api.getObjectiveStatusDistribution(params), api.getMonthlyProgress(params)
        ]);
    }, []);

    const fetchObjectivesTabDataAPI = useCallback(async (period) => {
        const params = { period };
        return Promise.allSettled([api.getObjectivesProgressChartData(params), api.getRankedObjectives(params)]);
    }, []);

    const fetchCategoriesTabDataAPI = useCallback(async (period) => {
        const params = { period };
        return Promise.allSettled([api.getCategoryAverageProgress(params), api.getDetailedObjectivesByCategory(params)]);
    }, []);

    useEffect(() => {
        let isMounted = true;
        const loadData = async () => {
            if (!isMounted) return;
            setIsLoading(true);
            setError(null);

            try {
                const summaryResult = await api.getAnalysisSummary({ period: timePeriod });
                if (isMounted) setSummaryStats(prev => ({...prev, ...summaryResult.data})); else return;

                let tabDataPromise;
                if (activeTab === 'general') tabDataPromise = fetchAllGeneralDataAPI(timePeriod);
                else if (activeTab === 'byObjective') tabDataPromise = fetchObjectivesTabDataAPI(timePeriod);
                else if (activeTab === 'byCategory') tabDataPromise = fetchCategoriesTabDataAPI(timePeriod);

                if (tabDataPromise) {
                     const results = await tabDataPromise;
                     if(isMounted) {
                        if (activeTab === 'general') {
                            const [catDistRes, statusRes, monthlyRes] = results;
                            if (catDistRes.status === 'fulfilled') setRawCategoryDistribution(catDistRes.value.data || []);
                            if (statusRes.status === 'fulfilled') setRawObjectiveStatus(statusRes.value.data || []);
                            if (monthlyRes.status === 'fulfilled') setRawMonthlyProgress(monthlyRes.value.data || { labels: [], datasets: [] });
                        } else if (activeTab === 'byObjective') {
                            const [objProgressRes, rankedRes] = results;
                            if (objProgressRes.status === 'fulfilled') setRawObjectivesProgressData(objProgressRes.value.data || []);
                            if (rankedRes.status === 'fulfilled' && rankedRes.value.data) {
                                setTopProgressObjectives(rankedRes.value.data.top || []);
                                setLowProgressObjectives(rankedRes.value.data.low || []);
                            }
                        } else if (activeTab === 'byCategory') {
                            const [catAvgProgressRes, detailedByCatRes] = results;
                            if (catAvgProgressRes.status === 'fulfilled') setRawCategoryAverageProgress(catAvgProgressRes.value.data || []);
                            if (detailedByCatRes.status === 'fulfilled') setDetailedObjectivesByCategory(detailedByCatRes.value.data || []);
                        }
                     }
                }
            } catch (err) {
                if (isMounted) setError(err.message || t('toast.analysisLoadError'));
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };
        loadData();
        return () => { isMounted = false; };
    }, [activeTab, timePeriod, fetchAllGeneralDataAPI, fetchObjectivesTabDataAPI, fetchCategoriesTabDataAPI, t]);

    const categoryDistribution = useMemo(() =>
        (rawCategoryDistribution || []).map((item, idx) => ({ ...item, name: t(categoryNameToKeyMap[item.name] || item.name), color: getCategoryColor(item.name, idx, summaryStats.categories) }))
    , [rawCategoryDistribution, getCategoryColor, summaryStats.categories, t]);

    const objectiveStatus = useMemo(() =>
        (rawObjectiveStatus || []).map((item) => ({ ...item, name: t(statusNameToKeyMap[item.name] || item.name), color: getStatusColorForChart(item.name) }))
    , [rawObjectiveStatus, getStatusColorForChart, t]);

    const objectivesProgressData = useMemo(() =>
        (rawObjectivesProgressData || []).map((item, idx) => ({ ...item, color: getCategoryColor(item.category, idx, summaryStats.categories) }))
    , [rawObjectivesProgressData, getCategoryColor, summaryStats.categories]);

    const categoryAverageProgress = useMemo(() =>
        (rawCategoryAverageProgress || []).map((item, idx) => ({ ...item, categoryName: t(categoryNameToKeyMap[item.categoryName] || item.categoryName), color: getCategoryColor(item.categoryName, idx, summaryStats.categories) }))
    , [rawCategoryAverageProgress, getCategoryColor, summaryStats.categories, t]);

    const coloredTopProgressObjectives = useMemo(() =>
        (topProgressObjectives || []).map((obj, idx) => {
            const originalCategoryKey = obj.tipo_objetivo;
            const translationKey = categoryNameToKeyMap[originalCategoryKey] || originalCategoryKey;
            return { ...obj, tipo_objetivo: t(translationKey), color: getCategoryColor(originalCategoryKey, idx, summaryStats.categories) };
        })
    , [topProgressObjectives, getCategoryColor, summaryStats.categories, t]);

    const coloredLowProgressObjectives = useMemo(() =>
        (lowProgressObjectives || []).map((obj, idx) => {
            const originalCategoryKey = obj.tipo_objetivo;
            const translationKey = categoryNameToKeyMap[originalCategoryKey] || originalCategoryKey;
            return { ...obj, tipo_objetivo: t(translationKey), color: getCategoryColor(originalCategoryKey, idx, summaryStats.categories) };
        })
    , [lowProgressObjectives, getCategoryColor, summaryStats.categories, t]);

    const coloredDetailedObjectivesByCategory = useMemo(() =>
        (detailedObjectivesByCategory || []).map((catData, catIdx) => ({
            ...catData, categoryName: t(categoryNameToKeyMap[catData.categoryName] || catData.categoryName), color: getCategoryColor(catData.categoryName, catIdx, summaryStats.categories),
            objectives: (catData.objectives || []).map((obj) => ({ ...obj, color: getCategoryColor(catData.categoryName, catIdx, summaryStats.categories) }))
        }))
    , [detailedObjectivesByCategory, getCategoryColor, summaryStats.categories, t]);

    const dynamicTrendSubtitle = useMemo(() => {
        const selectedOption = timePeriodOptions.find(option => option.value === timePeriod);
        return t('analysis.stats.trendSubtitle', { period: selectedOption ? t(selectedOption.key) : '' });
    }, [timePeriod, timePeriodOptions, t]);

    const renderCurrentTabContent = () => {
        const translatedTabName = t(`analysis.tabs.${activeTab}`);
        if (isLoading) return <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] flex-grow"><LoadingSpinner size="large" text={t('loaders.loadingTab', { tab: translatedTabName })} /></div>;
        if (error) return <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px] flex-grow"><p className="text-[var(--destructive)] mb-4">{error}</p><Button onClick={() => { const p = timePeriod; setTimePeriod(''); setTimeout(() => setTimePeriod(p), 0);}} className="!mt-0">{t('common.retry')}</Button></div>;

        switch (activeTab) {
            case 'general':
                return (<motion.div variants={containerVariants} initial="hidden" animate="show">
                    <motion.section variants={panelVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col">
                            <h3 className="text-lg font-semibold text-[var(--heading-color,var(--foreground))] m-0 block mb-[0.25rem]">{t('analysis.chartTitles.categoryDistribution')}</h3>
                            <span className="text-sm text-[var(--muted-foreground)] m-0 block mb-5">{t('analysis.chartTitles.categoryDistributionSubtitle')}</span>
                            <div className="flex flex-col min-h-[280px] flex-grow relative">{categoryDistribution.length > 0 ? <CategoryDonutChart data={categoryDistribution} /> : <p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDetailedObjectives')}</p>}</div>
                        </div>
                        <div className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col">
                            <h3 className="text-lg font-semibold text-[var(--heading-color,var(--foreground))] m-0 block mb-[0.25rem]">{t('analysis.chartTitles.objectiveStatus')}</h3>
                            <span className="text-sm text-[var(--muted-foreground)] m-0 block mb-5">{t('analysis.chartTitles.objectiveStatusSubtitle')}</span>
                            <div className="flex flex-col min-h-[280px] flex-grow relative">{objectiveStatus.length > 0 ? <ObjectiveStatusChart data={objectiveStatus} /> : <p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('charts.noStatusData')}</p>}</div>
                        </div>
                    </motion.section>
                    <motion.section variants={panelVariants} className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col">
                        <h3 className="text-lg font-semibold text-[var(--heading-color,var(--foreground))] m-0 block mb-[0.25rem]">{t('analysis.chartTitles.monthlyProgress')}</h3>
                        <span className="text-sm text-[var(--muted-foreground)] m-0 block mb-5">{t('analysis.chartTitles.monthlyProgressSubtitle')}</span>
                        <div className="flex flex-col min-h-[280px] flex-grow relative min-h-[200px]">
                            {(rawMonthlyProgress?.datasets?.length > 0) ? (
                                <MonthlyProgressChart data={rawMonthlyProgress} />
                            ) : (
                                <p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDataMessages.monthlyProgress')}</p>
                            )}
                        </div>
                    </motion.section>
                </motion.div>);
            case 'byCategory':
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="show">
                        <motion.section variants={panelVariants} className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col">
                            <h3 className="text-lg font-semibold text-[var(--heading-color,var(--foreground))] m-0 block mb-[0.25rem]">{t('analysis.chartTitles.categoryAverageProgress')}</h3>
                            <span className="text-sm text-[var(--muted-foreground)] m-0 block mb-5">{t('analysis.chartTitles.categoryAverageProgressSubtitle')}</span>
                            <div className="flex flex-col min-h-[280px] flex-grow relative min-h-[200px]">{categoryAverageProgress.length > 0 ? <CategoryAverageProgressBarChart data={categoryAverageProgress} /> : <p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDataMessages.categoryAverageProgress')}</p>}</div>
                        </motion.section>
                        <motion.section variants={panelVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-2">{coloredDetailedObjectivesByCategory.length > 0 ? coloredDetailedObjectivesByCategory.map((catData, index) => (<CategoryObjectivesCard key={catData.categoryName || index} categoryName={catData.categoryName} objectiveCount={catData.objectiveCount} objectives={catData.objectives} color={catData.color}/>)) : (!isLoading && <div className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col"><p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDetailedObjectives')}</p></div>)}</motion.section>
                    </motion.div>
                );
            case 'byObjective':
                return (<motion.div variants={containerVariants} initial="hidden" animate="show">
                    <motion.section variants={panelVariants} className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col">
                        <h3 className="text-lg font-semibold text-[var(--heading-color,var(--foreground))] m-0 block mb-[0.25rem]">{t('analysis.chartTitles.objectiveProgress')}</h3>
                        <span className="text-sm text-[var(--muted-foreground)] m-0 block mb-5">{t('analysis.chartTitles.objectiveProgressSubtitle')}</span>
                        <div className="flex flex-col min-h-[280px] flex-grow relative min-h-[200px]">{objectivesProgressData.length > 0 ? <ObjectiveProgressBarChart data={objectivesProgressData} /> : <p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDataMessages.objectiveProgress')}</p>}</div>
                    </motion.section>
                    <motion.section variants={panelVariants} className="grid grid-cols-1 gap-6 md:grid-cols-2">{coloredTopProgressObjectives.length > 0 || coloredLowProgressObjectives.length > 0 ? (<><RankedObjectivesList title={t('analysis.chartTitles.topProgress')} objectives={coloredTopProgressObjectives} noDataMessage={t('analysis.noDataMessages.topProgress')} /><RankedObjectivesList title={t('analysis.chartTitles.lowProgress')} objectives={coloredLowProgressObjectives} noDataMessage={t('analysis.noDataMessages.lowProgress')} /></>) : (!isLoading && <div className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col"><p className="flex-grow flex items-center justify-center text-sm text-[var(--muted-foreground)] min-h-[100px]">{t('analysis.noDataMessages.rankedObjectives')}</p></div>)}</motion.section>
                </motion.div>);
            default:
                return <div className="bg-[var(--card,#ffffff)] p-6 rounded-[var(--radius-lg,12px)] border border-[var(--border-light,#e9ecef)] shadow-[var(--shadow-sm)] flex flex-col"><p>{t('analysis.selectTabPrompt')}</p></div>;
        }
    };

    return (
        <motion.div
            className="px-8 py-6 m-0 w-full flex flex-col gap-6 flex-grow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex justify-between items-center flex-wrap gap-4 mb-2">
                <h1 className="text-[1.75rem] text-[var(--heading-color,var(--foreground))] m-0 font-semibold">{t('pageTitles.analysisTrends')}</h1>
                <div>
                    <Input type="select" id="time-period-filter" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)} className="min-w-[160px]">
                        {timePeriodOptions.map(option => (<option key={option.value} value={option.value}>{t(option.key)}</option>))}
                    </Input>
                </div>
            </div>

            <motion.section
                className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={panelVariants}><StatsCard title={t('analysis.stats.totalObjectives')} value={summaryStats.totalObjectives.toString()} ><p className="text-xs text-[var(--muted-foreground)] m-[0.1rem_0_0_0] leading-normal">{t('analysis.stats.active')}: {summaryStats.activeObjectives}</p><p className="text-xs text-[var(--muted-foreground)] m-[0.1rem_0_0_0] leading-normal">{t('analysis.stats.completed')}: {summaryStats.completedObjectives}</p></StatsCard></motion.div>
                <motion.div variants={panelVariants}><StatsCard title={t('analysis.stats.averageProgress')} value={`${Math.round(summaryStats.averageProgress)}%`} /></motion.div>
                <motion.div variants={panelVariants}><StatsCard title={t('analysis.stats.categories')} value={summaryStats.categoryCount.toString()}>
                    <div className="flex flex-wrap gap-[0.4rem] mt-2">
                        {summaryStats.categories.slice(0, 3).map((cat, index) => (<span key={cat.name} className="text-xs px-2 py-[0.2rem] rounded-[var(--radius)] text-white font-medium capitalize" style={{ backgroundColor: getCategoryColor(cat.name, index, summaryStats.categories) }}>{t(categoryNameToKeyMap[cat.name] || cat.name)}</span>))}
                        {summaryStats.categories.length > 3 && <span className="text-xs px-[0.3rem] py-[0.2rem] text-[var(--muted-foreground)]">{t('analysis.stats.moreCategories', { count: summaryStats.categories.length - 3 })}</span>}
                    </div>
                </StatsCard></motion.div>
                <motion.div variants={panelVariants}><StatsCard title={t('analysis.stats.trend')} value={summaryStats.trend?.textKey ? t(summaryStats.trend.textKey) : '...'} ><p className="text-xs text-[var(--muted-foreground)] mt-[0.3rem] leading-tight">{dynamicTrendSubtitle}</p></StatsCard></motion.div>
            </motion.section>

            <div className="inline-flex items-center bg-[var(--accent)] rounded-[var(--radius-lg,0.75rem)] p-[0.3rem] border border-[var(--border)] mb-8 max-w-max">
                <Button onClick={() => setActiveTab('general')} className={`bg-transparent !border-none !m-0 !shadow-none px-4 py-2 rounded-[var(--radius-md,0.5rem)] font-semibold text-sm text-[var(--muted-foreground)] transition-all duration-200 hover:!bg-[var(--muted)] hover:!text-[var(--foreground)] ${activeTab === 'general' ? '!bg-[var(--card)] !text-[var(--foreground)] !shadow-[var(--shadow-sm)] !font-bold' : ''}`} >{t('analysis.tabs.general')}</Button>
                <Button onClick={() => setActiveTab('byCategory')} className={`bg-transparent !border-none !m-0 !shadow-none px-4 py-2 rounded-[var(--radius-md,0.5rem)] font-semibold text-sm text-[var(--muted-foreground)] transition-all duration-200 hover:!bg-[var(--muted)] hover:!text-[var(--foreground)] ${activeTab === 'byCategory' ? '!bg-[var(--card)] !text-[var(--foreground)] !shadow-[var(--shadow-sm)] !font-bold' : ''}`} >{t('analysis.tabs.byCategory')}</Button>
                <Button onClick={() => setActiveTab('byObjective')} className={`bg-transparent !border-none !m-0 !shadow-none px-4 py-2 rounded-[var(--radius-md,0.5rem)] font-semibold text-sm text-[var(--muted-foreground)] transition-all duration-200 hover:!bg-[var(--muted)] hover:!text-[var(--foreground)] ${activeTab === 'byObjective' ? '!bg-[var(--card)] !text-[var(--foreground)] !shadow-[var(--shadow-sm)] !font-bold' : ''}`} >{t('analysis.tabs.byObjective')}</Button>
            </div>
            <div className="flex flex-col gap-8">{renderCurrentTabContent()}</div>
        </motion.div>
    );
}

export default AnalysisPage;
