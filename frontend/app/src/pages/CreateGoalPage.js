import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import api from "../services/apiService";
import { useAuth } from "../context/AuthContext";

import ObjetivosForm from "../components/objetivos/ObjetivosForm";
import TemplateSelector from "../components/templates/TemplateSelector";
import Button from "../components/ui/Button";

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
        <motion.div
            className="min-h-screen bg-[var(--background)] py-8 px-4 sm:px-6 box-border"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
        >
            <div className="max-w-[768px] mx-auto w-full px-[0.8rem] box-border">
                <motion.div
                    className="flex items-center justify-between mb-4"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: 0.1 }}
                >
                    <h2 className="text-center mb-6 mt-0 text-[var(--foreground)] text-[1.8rem]">
                        {user?.hasObjectives ? t('createGoalPage.title.new') : t('createGoalPage.title.first')}
                    </h2>
                    <Button variant="outline" size="small" onClick={() => setShowTemplateSelector(true)}>
                        {t('createGoalPage.fromTemplate', 'From Template')}
                    </Button>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <ObjetivosForm
                        key={initialFormData ? JSON.stringify(initialFormData) : 'default'}
                        initialData={initialFormData}
                        onSubmit={handleObjectiveSubmission}
                        onCancel={handleCancel}
                        isEditMode={false}
                        buttonText={t('objectivesForm.createButton')}
                    />
                </motion.div>
            </div>
            {showTemplateSelector && (
                <TemplateSelector
                    onSelectTemplate={handleSelectTemplate}
                    onClose={() => setShowTemplateSelector(false)}
                />
            )}
        </motion.div>
    );
}

export default CreateObjectivePage;
