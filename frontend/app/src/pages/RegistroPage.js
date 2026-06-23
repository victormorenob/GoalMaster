import React from "react";
import RegistrationForm from "../components/auth/RegistroForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authStyles from "../layouts/AuthLayout.module.css";

function RegistrationPage() {
    const { t } = useTranslation();
    return (
        <div className="formContainer">
            <h1 className={authStyles.formTitle}>{t('registroPage.title')}</h1>
            <RegistrationForm />
            <p className={authStyles.formFooter}>
                {t('registroPage.prompt')}{" "}
                <Link to="/login" className={authStyles.formLink}>
                    {t('registroPage.loginLink')}
                </Link>
            </p>
        </div>
    );
}

export default RegistrationPage;