import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/apiService';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import { format, parseISO, isValid } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';

function UpdateProgressPage() {
    const { id: objectiveId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [goalData, setGoalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const fetchGoalDetails = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const response = await api.getObjectiveById(objectiveId);
            const objectiveData = response?.data?.objective;
            if (!objectiveData) {
                throw new Error('Objetivo no encontrado.');
            }
            setGoalData(objectiveData);
        } catch (err) {
            setError(err.message || t('errors.objectiveLoadError'));
            toast.error(err.message || t('toast.objectiveLoadDetailsError'));
        } finally { setLoading(false); }
    }, [objectiveId, t]);

    useEffect(() => {
        if (objectiveId) fetchGoalDetails();
    }, [objectiveId, fetchGoalDetails]);
    
    if (loading) return (<div className="flex justify-center items-start bg-[var(--background)]"><LoadingSpinner size='large' text={t('loaders.loadingObjectiveForEdit')}/></div>);
    if (error && !goalData) return (<div className="flex justify-center items-start bg-[var(--background)] text-center p-8 text-[var(--destructive)] font-medium"><p>{error}</p><Button onClick={() => navigate('/')}>{t('common.backToDashboard')}</Button></div>);
    if (!goalData) return (<div className="flex justify-center items-start bg-[var(--background)]"><p>{t('errors.objectiveNotFound')}</p><Button onClick={() => navigate('/')}>{t('common.backToDashboard')}</Button></div>);
    
    if (goalData.status === 'ARCHIVED') {
        return ( 
            <div className="flex justify-center items-start bg-[var(--background)]">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full max-w-[600px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-center text-[var(--foreground)] flex flex-col items-center gap-5">
                    <h2 className="text-[1.5rem] mb-4 text-[var(--primary)]">{t('updateProgressPage.titleArchived', { name: goalData.name })}</h2>
                    <p className="text-[1rem] leading-relaxed mb-6">{t('updateProgressPage.archivedError')}</p>
                    <div className="flex justify-center gap-3">
                        <Button onClick={() => navigate(`/objectives/${objectiveId}`)} variant="secondary">{t('updateProgressPage.backToObjective')}</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (goalData.targetValue === null || isNaN(Number(goalData.targetValue))) {
        return ( 
            <div className="flex justify-center items-start bg-[var(--background)]">
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full max-w-[600px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-center text-[var(--foreground)] flex flex-col items-center gap-5">
                    <h2 className="text-[1.5rem] mb-4 text-[var(--primary)]">{t('updateProgressPage.title', { name: goalData.name })}</h2>
                    <p className="text-[1rem] leading-relaxed mb-6">{t('updateProgressPage.notQuantitative')}</p>
                    <p className="text-[1rem] leading-relaxed mb-6">{t('updateProgressPage.notQuantitativeSuggestion')}</p>
                    <div className="flex justify-center gap-3">
                        <Button onClick={() => navigate(`/objectives/${objectiveId}`)} variant="secondary">{t('updateProgressPage.backToObjective')}</Button>
                        <Button onClick={() => navigate(`/objectives/edit/${objectiveId}`)}>{t('common.edit')}</Button>
                    </div>
                </div>
            </div>
        );
    }

    return <QuantitativeUpdateForm goalData={goalData} />;
}


function QuantitativeUpdateForm({ goalData }) {
    const { id: objectiveId } = useParams();
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const [newProgressValue, setNewProgressValue] = useState(() => (goalData.currentValue != null) ? String(goalData.currentValue) : (goalData.initialValue != null) ? String(goalData.initialValue) : '');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const dateLocale = i18n.language === 'es' ? es : enUS;

    const determineNewStatusLogic = (currentValueNum, targetValueNum, initialValueNum, currentStatus, isLowerBetter) => {
        if (isNaN(currentValueNum) || isNaN(targetValueNum) || isNaN(initialValueNum)) {
            return currentStatus;
        }
        let newStatus = currentStatus;
        if (isLowerBetter ? (currentValueNum <= targetValueNum) : (currentValueNum >= targetValueNum)) {
            newStatus = 'COMPLETED';
        } else if (currentStatus === 'PENDING' || currentStatus === 'COMPLETED') {
            newStatus = 'IN_PROGRESS';
        }
        return newStatus;
    };

    const handleValueChange = (e) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value) || value === '') setNewProgressValue(value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); setError(null);
        if (newProgressValue.trim() === '') { toast.error(t('toast.progressUpdate.valueRequiredError')); setIsSubmitting(false); return; }
        
        const valueToUpdate = parseFloat(newProgressValue);
        if (isNaN(valueToUpdate)) { toast.error(t('toast.progressUpdate.invalidValueError')); setIsSubmitting(false); return; }

        const calculatedNewStatus = determineNewStatusLogic(valueToUpdate, Number(goalData.targetValue), Number(goalData.initialValue), goalData.status, goalData.isLowerBetter);
        const payload = { status: calculatedNewStatus, progressData: { value: valueToUpdate, notes: notes.trim() === '' ? null : notes.trim() } };

        try {
            await api.updateObjective(objectiveId, payload);
            toast.success(t('toast.progressUpdate.success'));
            navigate(`/objectives/${objectiveId}`);
        } catch (err) {
            const errorMessage = err.message || t('toast.progressUpdate.unknownUpdateError');
            setError(errorMessage);
            toast.error(errorMessage);
        } finally { setIsSubmitting(false); }
    };

    const progressPercentage = useMemo(() => {
        const initial = Number(goalData.initialValue || 0);
        const target = Number(goalData.targetValue);
        const isLower = goalData.isLowerBetter;
        const current = newProgressValue !== '' && !isNaN(parseFloat(newProgressValue)) ? parseFloat(newProgressValue) : Number(goalData.currentValue ?? initial);
        if (isNaN(initial) || isNaN(current) || isNaN(target)) return 0;
        if (initial === target) return (isLower ? current <= target : current >= target) ? 100 : 0;
        let prog = isLower ? ((initial - current) / (initial - target)) * 100 : ((current - initial) / (target - initial)) * 100;
        return Math.max(0, Math.min(100, prog));
    }, [goalData, newProgressValue]);

    const lastUpdateDate = useMemo(() => {
        const dateStr = goalData?.updatedAt || goalData?.createdAt;
        if (dateStr && isValid(parseISO(dateStr))) return format(parseISO(dateStr), 'd/M/yyyy HH:mm', { locale: dateLocale });
        return t('common.notAvailable');
    }, [goalData, dateLocale]);

    const displayCurrentValue = useMemo(() => {
        let valueToShow = newProgressValue !== '' && !isNaN(parseFloat(newProgressValue)) ? parseFloat(newProgressValue) : Number(goalData.currentValue ?? goalData.initialValue ?? 0);
        return valueToShow.toFixed(1);
    }, [newProgressValue, goalData]);
    
    return (
        <div className="flex justify-center items-start bg-[var(--background)]">
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-[var(--radius)] p-8 w-full max-w-[500px] shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex flex-col gap-6">
                <div className="text-center mb-4">
                    <h1 className="text-[1.8rem] text-[var(--foreground)] mb-2 font-bold">{goalData.name}</h1>
                    <p className="text-[0.95rem] text-[var(--muted-foreground)] mb-4">{goalData.description || t('common.noDescription')}</p>
                </div>
                <div className="bg-[var(--background)] border border-[var(--border)] rounded-[var(--radius)] p-4 px-6 flex flex-col items-center gap-2">
                    <h2 className="text-[1.1rem] text-[var(--foreground)] font-semibold mb-2 text-center w-full">{t('updateProgressPage.progressPreviewTitle')}</h2>
                    <div className="w-full mb-4">
                        <div className="flex justify-between items-center mb-2"><span className="text-[0.9rem] text-[var(--muted-foreground)] font-medium">{t('updateProgressPage.progressLabel')}</span><span className="text-[1.2rem] font-bold text-[var(--primary)]">{Math.round(progressPercentage)}%</span></div>
                        <div className="w-full h-2 bg-[var(--muted)] rounded overflow-hidden"><div className={`h-full rounded transition-[width] duration-300 ease-in-out ${progressPercentage < 33 ? 'bg-[var(--destructive)]' : progressPercentage < 66 ? 'bg-[var(--warning)]' : 'bg-[var(--success)]'}`} style={{ width: `${progressPercentage}%` }}></div></div>
                    </div>
                    <div className="flex justify-around w-full mt-4 gap-4 bg-[var(--border)] p-4 rounded-lg">
                        <div className="flex flex-col items-start text-center flex-1"><span className="text-[0.85rem] text-[var(--muted-foreground)] mb-0.5">{t('updateProgressPage.newValueLabel')}</span><span className="text-[1.1rem] font-semibold text-[var(--foreground)]">{displayCurrentValue} {goalData.unit || ''}</span></div>
                        <div className="flex flex-col items-start text-center flex-1"><span className="text-[0.85rem] text-[var(--muted-foreground)] mb-0.5">{t('updateProgressPage.targetValueLabel')}</span><span className="text-[1.1rem] font-semibold text-[var(--foreground)]">{Number(goalData.targetValue || 0).toFixed(1)} {goalData.unit || ''}</span></div>
                    </div>
                    <p className="text-[0.8rem] text-[var(--muted-foreground)] mt-4">{t('updateProgressPage.lastUpdateInfo')}<span className="font-medium text-[var(--foreground)]">{lastUpdateDate}</span></p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="newProgressValue" className="text-[0.9rem] font-semibold text-[var(--foreground)]">{t('updateProgressPage.newProgressValueLabel')}</label>
                        <input type="text" id="newProgressValue" inputMode="decimal" className="p-3 px-4 border border-[var(--border)] rounded-[var(--radius)] text-[1rem] text-[var(--foreground)] w-full box-border bg-[var(--background)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)]" value={newProgressValue} onChange={handleValueChange} placeholder={t('updateProgressPage.newProgressValuePlaceholder', { unit: goalData.unit || 'unidades' })} autoFocus />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label htmlFor="notes" className="text-[0.9rem] font-semibold text-[var(--foreground)]">{t('updateProgressPage.notesLabel')}</label>
                        <textarea id="notes" className="p-3 px-4 border border-[var(--border)] rounded-[var(--radius)] text-[1rem] text-[var(--foreground)] w-full box-border bg-[var(--background)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--primary)_20%,transparent)] resize-y min-h-[80px]" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('updateProgressPage.notesPlaceholder')} rows="4"></textarea>
                    </div>
                    {error && <p className="text-[var(--destructive)] text-[0.85rem] mt-2 text-left">{error}</p>}
                    <div className="flex justify-between gap-3 mt-4">
                        <Button type="button" onClick={() => navigate(`/objectives/${objectiveId}`)} variant="secondary" disabled={isSubmitting}>{t('common.cancel')}</Button>
                        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? t('common.saving') : t('updateProgressPage.saveButton')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateProgressPage;