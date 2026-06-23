import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import api from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import ObjetivosForm from "../components/objetivos/ObjetivosForm";
import TemplateSelector from "../components/templates/TemplateSelector";
import styles from "./CreateGoalPage.module.css";

function CreateObjectivePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [templateData, setTemplateData] = useState(null);
    const [formKey, setFormKey] = useState(0);

    const handleTemplateSelect = (data) => {
        setTemplateData(data);
        setFormKey(k => k + 1);
        toast.info(t('templates.applied', { defaultValue: 'Plantilla aplicada al formulario' }));
    };

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

    return (
        <div className={styles.createGoalPageContainer}>
            <div className={styles.formWrapper}>
                <h2 className={styles.formTitle}>
                    {user?.hasObjectives ? t('createGoalPage.title.new') : t('createGoalPage.title.first')}
                </h2>
                <TemplateSelector onSelect={handleTemplateSelect} />
                <ObjetivosForm
                    key={formKey}
                    initialData={templateData}
                    onSubmit={handleObjectiveSubmission}
                    onCancel={handleCancel}
                    isEditMode={false}
                />
            </div>
        </div>
    );
}

export default CreateObjectivePage;
