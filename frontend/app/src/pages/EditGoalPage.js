import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/apiService';

import ObjetivosForm from '../components/objetivos/ObjetivosForm';
import LoadingSpinner from '../components/ui/LoadingSpinner';

function EditGoalPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [objective, setObjective] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isNaN(parseInt(id))) {
            toast.error(t('errors.invalidObjectiveId'));
            navigate('/my-objectives');
            return;
        }
        const fetchObjective = async () => {
            setLoading(true);
            try {
                const response = await api.getObjectiveById(id);

                const objective = response?.data?.objective;

                if (!objective) {
                    throw new Error(t('errors.objectiveNotFound'));
                }

                setObjective(objective);
            } catch (err) {
                setError(err.message || t('errors.objectiveLoadError'));
                toast.error(err.message || t('toast.objectiveLoadForEditError'));
                navigate('/my-objectives');
            } finally {
                setLoading(false);
            }
        };
        fetchObjective();
    }, [id, navigate, t]);

    const handleEditObjective = async (formData) => {
        try {
            await api.updateObjective(id, formData);
            toast.success(t('toast.objectiveUpdateSuccess'));
            navigate('/mis-objetivos');
        } catch (err) {
            toast.error(err.message || t('toast.objectiveUpdateError'));
        }
    };

    const handleCancelEdit = () => {
        navigate('/mis-objetivos');
    };

    if (loading) {
        return <div className="text-center text-lg text-[var(--color-muted-foreground)] p-8 bg-[var(--muted)] rounded-[var(--radius)] mt-8"><LoadingSpinner size="large" text={t('loaders.loadingObjectiveForEdit')} /></div>;
    }

    if (error) {
        return <div className="text-center text-lg text-[var(--destructive)] p-8 bg-[var(--destructive-soft-bg)] rounded-[var(--radius)] mt-8 border border-[var(--destructive)]">{error}</div>;
    }

    return (
        <motion.div
            className="max-w-[800px] mx-auto px-4 pt-8 pb-0 w-full overflow-y-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <motion.h1
                className="text-[1.8rem] text-[var(--foreground)] m-0 mb-6 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.1 }}
            >
                {t('pageTitles.editObjective')}
            </motion.h1>
            {objective && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.15 }}
                >
                    <ObjetivosForm
                        initialData={objective}
                        onSubmit={handleEditObjective}
                        isEditMode={true}
                        onCancel={handleCancelEdit}
                    />
                </motion.div>
            )}
        </motion.div>
    );
}

export default EditGoalPage;
