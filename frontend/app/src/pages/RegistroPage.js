import React from "react";
import { motion } from "framer-motion";
import RegistrationForm from "../components/auth/RegistroForm";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function RegistrationPage() {
    const { t } = useTranslation();
    return (
        <motion.div
            className="page-centered-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
        >
            <div className="formContainer">
                <h1 className="formTitle">{t('registroPage.title')}</h1>
                <RegistrationForm />
                <p className="formFooter">
                    {t('registroPage.prompt')}{" "}
                    <Link to="/login" className="formLink">
                        {t('registroPage.loginLink')}
                    </Link>
                </p>
            </div>
        </motion.div>
    );
}

export default RegistrationPage;
