import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { differenceInDays, parseISO, format, isValid, isPast, subDays, startOfDay } from 'date-fns';
import { es, enUS } from 'date-fns/locale';

import api from '../services/apiService';
import { calculateProgressPercentage } from '../utils/progressUtils';

import { FaCalendarAlt, FaFlagCheckered, FaExclamationTriangle, FaEdit, FaPlusCircle, FaTrashAlt } from 'react-icons/fa';
import { FiTrendingUp, FiClock } from 'react-icons/fi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import GoalProgressChart from '../components/charts/GoalProgressChart';
import DistributionBarChart from '../components/charts/DistributionBarChart';
import ProgressLineChart from '../components/charts/ProgressLineChart';

const CATEGORY_I18N_KEYS = {
    HEALTH: 'categories.health', FINANCE: 'categories.finance', 
    PERSONAL_DEV: 'categories.personalDevelopment', RELATIONSHIPS: 'categories.relationships', 
    CAREER: 'categories.career', OTHER: 'categories.other'
};

function GoalDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    
    const [objective, setObjective] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeframe, setTimeframe] = useState('all_time');

    const dateLocale = i18n.language === 'es' ? es : enUS;

    useEffect(() => {
        api.getObjectiveById(id)
            .then(response => {
                const objectiveData = response?.data?.objective;
                if (!objectiveData) {
                    throw new Error(t('errors.objectiveNotFound'));
                }
                setObjective(objectiveData);
            })
            .catch(err => {
                setError(err.message || t('errors.objectiveLoadError'));
                toast.error(err.message || t('errors.objectiveLoadError'));
            })
            .finally(() => setLoading(false));
    }, [id, t]);
    
    const isQuantitative = useMemo(() => (
        objective?.targetValue != null && !isNaN(Number(objective.targetValue))
    ), [objective]);

    const progressPercentage = useMemo(() => {
        if (!objective || !isQuantitative) return 0;
        return calculateProgressPercentage(objective);
    }, [objective, isQuantitative]);

    const chartValues = useMemo(() => {
        const defaults = { progressMade: 0, progressRemaining: 0, totalJourney: 0 };
        if (!isQuantitative || !objective) {
            return defaults;
        }

        const initial = parseFloat(objective.initialValue ?? 0);
        const current = parseFloat(objective.currentValue ?? initial);
        const target = parseFloat(objective.targetValue);

        if (isNaN(initial) || isNaN(current) || isNaN(target)) {
            return defaults;
        }

        const totalJourney = Math.abs(target - initial);
        const progressMade = Math.abs(current - initial);
        // Nos aseguramos de que el progreso restante nunca sea negativo
        const progressRemaining = Math.max(0, totalJourney - progressMade);

        return { progressMade, progressRemaining, totalJourney };
        
    }, [objective, isQuantitative]);

    const derivedData = useMemo(() => {
        const defaults = { daysRemaining: t('common.notAvailable'), isPastDue: false, trendText: t('goalDetail.trends.notApplicable') };
        if (!objective?.endDate) return defaults;
        
        const endDate = parseISO(objective.endDate);
        if (!isValid(endDate)) return defaults;

        const today = new Date();
        const isCompleted = objective.status === 'COMPLETED';
        const isPastDueCalc = isPast(endDate) && !isCompleted;
        
        defaults.isPastDue = isPastDueCalc;

        if(isCompleted) {
            defaults.daysRemaining = t('common.completed');
        } else if (isPastDueCalc) {
            defaults.daysRemaining = t('goalDetail.overdue');
        } else {
            defaults.daysRemaining = differenceInDays(endDate, today);
        }
        
        if (isQuantitative && objective.startDate && !isCompleted) {
            const startDate = parseISO(objective.startDate);
            const totalDuration = differenceInDays(endDate, startDate);
            const elapsedDuration = differenceInDays(today, startDate);
            if (totalDuration > 0 && elapsedDuration > 0 && !isPastDueCalc) {
                const expectedProgress = (elapsedDuration / totalDuration) * 100;
                defaults.trendText = progressPercentage >= expectedProgress ? t('goalDetail.trends.onTrack') : t('goalDetail.trends.behind');
            }
        } else if (isCompleted) {
            defaults.trendText = t('goalDetail.trends.completed');
        }
        return defaults;
    }, [objective, progressPercentage, isQuantitative, t]);

    const filteredProgressHistory = useMemo(() => {
        if (!objective?.progressEntries) return [];
        if (timeframe === 'all_time') return objective.progressEntries;

        const today = startOfDay(new Date());
        let startDateFilter;
        switch (timeframe) {
            case '7_days': startDateFilter = subDays(today, 6); break;
            case '30_days': startDateFilter = subDays(today, 29); break;
            default: return objective.progressEntries;
        }
        return objective.progressEntries.filter(entry => isValid(parseISO(entry.entryDate)) && startOfDay(parseISO(entry.entryDate)) >= startDateFilter);
    }, [objective, timeframe]);

    const handleDelete = async () => {
        if (window.confirm(t('confirmationDialog.deleteObjective', { name: objective.name }))) {
            try {
                await api.deleteObjective(id);
                toast.success(t('toast.objectiveDeleteSuccess'));
                navigate('/my-objectives');
            } catch (err) {
                toast.error(err.message || t('toast.objectiveDeleteError'));
            }
        }
    };
    
    if (loading) return <div className="w-full mx-auto font-[Inter] text-[var(--foreground)] bg-[var(--background)]"><LoadingSpinner size='large' text={t('loaders.loadingDetails')} /></div>;
    if (error) return <div className="w-full mx-auto font-[Inter] text-[var(--foreground)] bg-[var(--background)]"><p>{error}</p></div>;
    if (!objective) return <div className="w-full mx-auto font-[Inter] text-[var(--foreground)] bg-[var(--background)]"><p>{t('errors.objectiveNotFound')}</p></div>;

    const categoryKey = CATEGORY_I18N_KEYS[objective.category] || objective.category;

    return (
        <div className="w-full mx-auto font-[Inter] text-[var(--foreground)] bg-[var(--background)]">
            <header className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-4">
                <div className="flex flex-col items-start">
                    <h1 className="text-[1.6rem] font-semibold text-[var(--foreground)] m-0 max-md:text-[1.3rem] max-sm:text-[1.4rem]">{objective.name}</h1>
                    <span className="bg-[var(--muted)] text-[var(--primary)] px-3 py-1 rounded-[20px] text-[0.75rem] font-medium uppercase mt-1 max-sm:text-[0.7rem]">{t(categoryKey)}</span>
                    <p className="text-[0.9rem] text-[var(--muted-foreground)] mt-1 max-md:block">{objective.description || t('common.noDescription')}</p>
                </div>
                <div className="flex gap-4 max-md:w-full max-md:justify-start max-md:gap-[0.6rem]">
                    <Button onClick={() => navigate(`/objectives/edit/${id}`)} leftIcon={<FaEdit />} disabled={objective.status === 'ARCHIVED'}>{t('common.edit')}</Button>
                    {isQuantitative && <Button onClick={() => navigate(`/objectives/${id}/update-progress`)} leftIcon={<FaPlusCircle />} disabled={objective.status === 'ARCHIVED'}>{t('goalDetail.buttons.updateProgress')}</Button>}
                    <Button data-cy="delete-objective-button" onClick={handleDelete} variant="destructive" leftIcon={<FaTrashAlt />}>{t('goalDetail.buttons.delete')}</Button>
                </div>
            </header>

            {derivedData.isPastDue && <div className="bg-[var(--destructive-soft-bg)] border border-[var(--destructive)] text-[var(--destructive)] p-3 rounded-[var(--radius)] mt-6 flex flex-col items-center text-[0.85rem] w-[95%]"><FaExclamationTriangle className="text-[1.8rem] mb-1" /> {t('goalDetail.overdue')}</div>}

            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 mb-6 max-md:grid-cols-1">
                {isQuantitative && (
                    <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow-sm)] p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] dark:border dark:border-[var(--border-light)] items-center text-center">
                        <h2 className="text-[1.1rem] font-semibold text-[var(--card-foreground)] mt-0 mb-2 self-start">{t('goalDetail.cards.progress')}</h2>
                        <div className="w-[100px] h-[100px] mt-5 mb-5 relative flex justify-center items-center"><GoalProgressChart progressPercentage={progressPercentage} /></div>
                        <div className="flex justify-around items-center mt-4 w-full max-w-[250px] gap-4">
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-[0.9rem] text-[var(--muted-foreground)] mb-0.5">{t('goalDetail.dataLabels.current')}</span>
                                <span className="text-[1.4rem] font-semibold text-[var(--card-foreground)]">{Number(objective.currentValue ?? objective.initialValue).toLocaleString()} {objective.unit}</span>
                            </div>
                            <div className="flex flex-col items-center flex-1">
                                <span className="text-[0.9rem] text-[var(--muted-foreground)] mb-0.5">{t('goalDetail.dataLabels.target')}</span>
                                <span className="text-[1.4rem] font-semibold text-[var(--card-foreground)]">{Number(objective.targetValue).toLocaleString()} {objective.unit}</span>
                            </div>
                        </div>
                    </div>
                )}
                <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow-sm)] p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] dark:border dark:border-[var(--border-light)]">
                    <h2 className="text-[1.1rem] font-semibold text-[var(--card-foreground)] mt-0 mb-2 self-start">{t('goalDetail.cards.keyData')}</h2>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-[0.9rem]"><FaCalendarAlt className="text-[var(--muted-foreground)] text-[1rem] min-w-[18px]" /><span>{t('goalDetail.dataLabels.startDate')}</span><span>{objective.startDate ? format(parseISO(objective.startDate), 'PPP', { locale: dateLocale }) : 'N/A'}</span></div>
                        <div className="flex items-center gap-3 text-[0.9rem]"><FaFlagCheckered className="text-[var(--muted-foreground)] text-[1rem] min-w-[18px]" /><span>{t('goalDetail.dataLabels.deadline')}</span><span>{objective.endDate ? format(parseISO(objective.endDate), 'PPP', { locale: dateLocale }) : 'N/A'}</span></div>
                        <div className="flex items-center gap-3 text-[0.9rem]"><FiClock className="text-[var(--muted-foreground)] text-[1rem] min-w-[18px]" /><span>{t('goalDetail.dataLabels.daysRemaining')}</span><span>{derivedData.daysRemaining}</span></div>
                        {isQuantitative && <div className="flex items-center gap-3 text-[0.9rem]"><FiTrendingUp className="text-[var(--primary)] text-[1rem] min-w-[18px]" /><span>{t('goalDetail.dataLabels.trend')}</span><span>{derivedData.trendText}</span></div>}
                    </div>
                </div>
                {isQuantitative && (
                    <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow-sm)] p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] dark:border dark:border-[var(--border-light)] items-center text-center">
                        <h2 className="text-[1.1rem] font-semibold text-[var(--card-foreground)] mt-0 mb-2 self-start">{t('goalDetail.cards.progressDistribution')}</h2>
                        <div className="relative">
                            <DistributionBarChart 
                                progressMade={chartValues.progressMade}
                                progressRemaining={chartValues.progressRemaining}
                                totalJourney={chartValues.totalJourney}
                                unit={objective.unit}
                            />
                        </div>
                    </div>
                )}
            </div>
            
            {isQuantitative && (
                <div className="bg-[var(--card)] rounded-xl shadow-[var(--shadow-sm)] p-5 flex flex-col justify-between min-h-[220px] transition-all duration-300 hover:-translate-y-[3px] hover:shadow-[var(--shadow-md)] dark:border dark:border-[var(--border-light)] mb-6 col-span-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[1.1rem] font-semibold text-[var(--card-foreground)] mt-0 mb-2 self-start">{t('goalDetail.cards.progressEvolution')}</h2>
                        <select className="p-1.5 px-3 border border-[var(--border)] rounded-[var(--radius)] text-[0.85rem] text-[var(--muted-foreground)] bg-[var(--card)] cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20d%3D%22M9.293%2012.95l.707.707L15.657%208l-1.414-1.414L10%2010.828%205.757%206.586%204.343%208z%22%20fill%3D%22currentColor%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_1rem_center] bg-[length:0.8em] pr-8" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                            <option value="7_days">{t('goalDetail.timeframes.7days')}</option>
                            <option value="30_days">{t('goalDetail.timeframes.30days')}</option>
                            <option value="all_time">{t('goalDetail.timeframes.allTime')}</option>
                        </select>
                    </div>
                    <div className="min-h-[300px] flex justify-center items-center bg-[var(--muted)] rounded-[var(--radius)] border border-dashed border-[var(--border)]">
                        {filteredProgressHistory.length >= 2 ? (
                            <ProgressLineChart
                                progressHistory={filteredProgressHistory}
                                unitMeasure={objective.unit}
                                targetValue={parseFloat(objective.targetValue)}
                                isLowerBetter={objective.isLowerBetter}
                            />
                        ) : (<p className="text-[var(--muted-foreground)] italic text-center p-4">{t('goalDetail.noData.notEnoughEvolutionData', { count: filteredProgressHistory.length })}</p>)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default GoalDetailPage;