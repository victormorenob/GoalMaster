import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

    // El handler ahora recibe el payload ya preparado por ObjetivosForm
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
        navigate('/mis-objetivos'); // Better to go back to the details page
    };

    if (loading) {
        return <div className="text-center text-[1.1rem] text-[var(--muted-foreground)] p-8 bg-[var(--muted)] rounded-[var(--radius)] mt-8"><LoadingSpinner size="large" text={t('loaders.loadingObjectiveForEdit')} /></div>;
    }

    if (error) {
        return <div className="text-center text-[1.1rem] text-[var(--destructive)] p-8 bg-[#fcebeb] rounded-[var(--radius)] mt-8 border border-[var(--destructive)]">{error}</div>;
    }

    return (
        <div className="max-w-[800px] mx-auto p-8 pt-8 pb-0 w-full overflow-y-hidden">
            <h1 className="text-[1.8rem] text-[var(--foreground)] m-0 text-center mb-6">{t('pageTitles.editObjective')}</h1>
            {objective && (
                <ObjetivosForm
                    initialData={objective}
                    onSubmit={handleEditObjective}
                    isEditMode={true}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
}

export default EditGoalPage;