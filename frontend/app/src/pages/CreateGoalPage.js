import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import api from "../services/apiService";
import { useAuth } from "../context/AuthContext";

import ObjetivosForm from "../components/objetivos/ObjetivosForm";
import TemplateSelector from "../components/templates/TemplateSelector";
import Button from "../components/ui/Button";
import styles from "./CreateGoalPage.module.css";

function CreateObjectivePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [initialFormData, setInitialFormData] = useState(null);

    const handleObjectiveSubmission = async (payload) => {
        try {
            await api.createObjective(payload);
            toast.success(t('toast.objectiveCreateSuccess'));
            navigate('/dashboard', { replace: true });
        } catch (err) {
            console.error("Error al crear el objetivo:", err);
        }
    };

    const handleCancel = () => {
        toast.info(t('toast.objectiveCreateCancel'));
        navigate('/dashboard');
    };

    const handleSelectTemplate = (templateData) => {
        setInitialFormData(templateData);
    };

    return (
        <div className={styles.createGoalPageContainer}>
            <div className={styles.formWrapper}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={styles.formTitle}>
                        {user?.hasObjectives ? t('createGoalPage.title.new') : t('createGoalPage.title.first')}
                    </h2>
                    <Button variant="outline" size="small" onClick={() => setShowTemplateSelector(true)}>
                        {t('createGoalPage.fromTemplate', 'From Template')}
                    </Button>
                </div>
                <ObjetivosForm
                    key={initialFormData ? JSON.stringify(initialFormData) : 'default'}
                    initialData={initialFormData}
                    onSubmit={handleObjectiveSubmission}
                    onCancel={handleCancel}
                    isEditMode={false}
                    buttonText={t('objectivesForm.createButton')}
                />
            </div>
            {showTemplateSelector && (
                <TemplateSelector
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplateSelector(false)}
                />
            )}
        </div>
    );
}

export default CreateObjectivePage;