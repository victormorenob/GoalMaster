import React from "react";
import LoginForm from "../components/auth/LoginForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import authStyles from "../layouts/AuthLayout.module.css";

function LoginPage() {
    const { t } = useTranslation();

    return (
        <div className="formContainer">
            <h1 className={authStyles.formTitle}>{t('loginPage.title')}</h1>
            <LoginForm />
            <p className={authStyles.formFooter}>
                {t('loginPage.prompt')}{" "}
                <Link to="/register" className={authStyles.formLink}>
                    {t('loginPage.registerLink')}
                </Link>
            </p>
        </div>
    );
}

export default LoginPage;