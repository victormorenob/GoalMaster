import React from "react";
import { motion } from "framer-motion";
import LoginForm from "../components/auth/LoginForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function LoginPage() {
    const { t } = useTranslation();

    return (
        <motion.div
            className="page-centered-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            <div className="formContainer">
                <h1 className="formTitle">{t('loginPage.title')}</h1>
                <LoginForm />
                <p className="formFooter">
                    {t('loginPage.prompt')}{" "}
                    <Link to="/register" className="formLink">
                        {t('loginPage.registerLink')}
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}

export default LoginPage;
