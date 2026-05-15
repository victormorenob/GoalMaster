import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from 'react-toastify';
import api from "../services/apiService";
import { useAuth } from "../context/AuthContext";

import ObjetivosForm from "../components/objetivos/ObjetivosForm";

function CreateObjectivePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();

    // El handler ahora recibe el payload ya formateado desde ObjetivosForm
    const handleObjectiveSubmission = async (payload) => {
        try {
            await api.createObjective(payload);
            toast.success(t('toast.objectiveCreateSuccess'));
            navigate('/dashboard', { replace: true });
        } catch (err) {
            // The apiService interceptor handles the generic toast
            console.error("Error al crear el objetivo:", err);
        }
    };

    const handleCancel = () => {
        toast.info(t('toast.objectiveCreateCancel'));
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] p-4 pt-8 pb-8 sm:px-6 box-border">
            <div className="max-w-3xl mx-auto w-full px-3 box-border">
                <h2 className="text-center mb-6 mt-0 text-[#333] text-[1.8rem]">
                    {user?.hasObjectives ? t('createGoalPage.title.new') : t('createGoalPage.title.first')}
                </h2>
                <ObjetivosForm
                    onSubmit={handleObjectiveSubmission}
                    onCancel={handleCancel}
                    isEditMode={false}
                />
            </div>
        </div>
    );
}

export default CreateObjectivePage;