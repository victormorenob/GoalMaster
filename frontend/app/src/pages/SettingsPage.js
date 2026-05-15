import React, { useState, useEffect, useCallback } from 'react';
import styles from './SettingsPage.module.css';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormGroup from '../components/ui/FormGroup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import { FaChevronDown, FaChevronUp, FaEye, FaEyeSlash, FaDownload, FaTrash, FaBell, FaFileExport } from 'react-icons/fa';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import useNotifications from '../hooks/useNotifications';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';
import api from '../services/apiService';

function SettingsPage() {
    const { settings, updateSettings, isLoadingSettings, applyTemporarySettings } = useSettings();
    const { t, i18n } = useTranslation();
    const {
        permission: notifPermission,
        reminderEnabled,
        reminderTime,
        requestPermission,
        enableReminder,
        disableReminder,
    } = useNotifications();

    const [localSettingsData, setLocalSettingsData] = useState(settings || {});
    const [isDirty, setIsDirty] = useState(false);

    const [isSaving, setIsSaving] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);
    const [isProcessingDataAction, setIsProcessingDataAction] = useState(false);
    const [passwordFormError, setPasswordFormError] = useState(null);
    const [dataAccountError, setDataAccountError] = useState(null);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [openSections, setOpenSections] = useState({
        notifications: true,
        appearance: true,
        changePassword: true,
        dataAccount: true,
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [reminderTimeInput, setReminderTimeInput] = useState(reminderTime || '20:00');

    useEffect(() => {
        if (settings) {
            setLocalSettingsData(settings);
            if (i18n.language !== settings.language) {
                i18n.changeLanguage(settings.language);
            }
        }
    }, [settings, i18n]);

    useEffect(() => {
        const hasChanges = JSON.stringify(settings) !== JSON.stringify(localSettingsData);
        setIsDirty(hasChanges);
    }, [settings, localSettingsData]);

    const handleInputChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setLocalSettingsData(prev => {
            const updatedData = { ...prev, [name]: newValue };

            if (name === 'themePreference' || name === 'dateFormat') {
                if (applyTemporarySettings) {
                    applyTemporarySettings({ [name]: newValue });
                } else {
                    if (name === 'themePreference') {
                        document.documentElement.setAttribute('data-theme', newValue);
                    }
                }
            }
            return updatedData;
        });
    }, [applyTemporarySettings]);

    const handleLanguageChange = useCallback((e) => {
        const newLang = e.target.value;
        i18n.changeLanguage(newLang);
        setLocalSettingsData(prev => ({ ...prev, language: newLang }));
    }, [i18n]);

    const handleRevertChanges = useCallback(() => {
        setLocalSettingsData(settings);
        if (i18n.language !== settings.language) {
            i18n.changeLanguage(settings.language);
        }
        if (applyTemporarySettings) {
            applyTemporarySettings(settings);
        } else {
            document.documentElement.setAttribute('data-theme', settings.themePreference || 'system');
        }
        toast.info(t('toast.changesReverted'));
    }, [settings, i18n, t, applyTemporarySettings]);

    const handleSaveAllSettings = useCallback(async () => {
        setIsSaving(true);
        try {
            await updateSettings(localSettingsData);
            toast.success(t('toast.settingsSaveSuccess'));
        } catch (err) {
            // Error toast handled by context or interceptor
        } finally {
            setIsSaving(false);
        }
    }, [localSettingsData, updateSettings, t]);

    const handlePasswordInputChange = useCallback((e) => {
        const { name, value } = e.target;
        if (name === 'currentPassword') setCurrentPassword(value);
        else if (name === 'newPassword') setNewPassword(value);
        else if (name === 'confirmNewPassword') setConfirmNewPassword(value);
    }, []);

    const handleChangePassword = useCallback(async (e) => {
        e.preventDefault();
        setIsSavingPassword(true);
        setPasswordFormError(null);
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            const errorMsg = t('formValidation.allPasswordFieldsRequired');
            setPasswordFormError(errorMsg);
            toast.error(errorMsg);
            setIsSavingPassword(false);
            return;
        }
        if (newPassword.length < 8) {
            const errorMsg = t('formValidation.passwordMinLength', { count: 8 });
            setPasswordFormError(errorMsg);
            toast.error(errorMsg);
            setIsSavingPassword(false);
            return;
        }
        if (newPassword !== confirmNewPassword) {
            const errorMsg = t('formValidation.passwordsDoNotMatch');
            setPasswordFormError(errorMsg);
            toast.error(errorMsg);
            setIsSavingPassword(false);
            return;
        }
        try {
            await apiService.changePassword({ currentPassword, newPassword });
            toast.success(t('toast.passwordUpdated'));
            setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
            setPasswordFormError(null);
        } catch (err) {
            const errorMessage = err.data?.message || err.message || t('toast.passwordUpdateError');
            setPasswordFormError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSavingPassword(false);
        }
    }, [currentPassword, newPassword, confirmNewPassword, t]);

    const handleExportData = useCallback(async () => {
        setIsProcessingDataAction(true);
        setDataAccountError(null);
        try {
            const responseData = await apiService.exportUserData();
            const jsonString = JSON.stringify(responseData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `datos_goalmaster_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            toast.success(t('toast.exportSuccess'));
        } catch (err) {
            const errorMessage = err.data?.message || err.message || t('toast.exportError');
            setDataAccountError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsProcessingDataAction(false);
        }
    }, [t]);

    const handleExportCSV = useCallback(async () => {
        setIsProcessingDataAction(true);
        try {
            const response = await api.getObjectives({ includeArchived: true });
            const objectives = response?.data?.objectives || [];
            exportToCSV(objectives);
            toast.success(t('toast.exportSuccess'));
        } catch (err) {
            toast.error(err.message || t('toast.exportError'));
        } finally {
            setIsProcessingDataAction(false);
        }
    }, [t]);

    const handleExportJSON = useCallback(async () => {
        setIsProcessingDataAction(true);
        try {
            const response = await api.getObjectives({ includeArchived: true });
            const objectives = response?.data?.objectives || [];
            exportToJSON(objectives, `goalmaster_objectives_${new Date().toISOString().split('T')[0]}.json`);
            toast.success(t('toast.exportSuccess'));
        } catch (err) {
            toast.error(err.message || t('toast.exportError'));
        } finally {
            setIsProcessingDataAction(false);
        }
    }, [t]);

    const handleDeleteAccount = useCallback(async () => {
        if (!window.confirm(t('settingsPage.data.deleteConfirmation'))) {
            return;
        }
        setIsProcessingDataAction(true);
        setDataAccountError(null);
        try {
            await apiService.deleteAccount();
            toast.success(t('toast.accountDeleted'));
            window.dispatchEvent(new CustomEvent('logoutUser', { detail: { reason: 'accountDeleted', notifyBackend: false } }));
        } catch (err) {
            const errorMessage = err.data?.message || err.message || t('toast.deleteAccountError');
            setDataAccountError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsProcessingDataAction(false);
        }
    }, [t]);

    const handleEnableReminder = useCallback(async () => {
        const success = await enableReminder(reminderTimeInput);
        if (success) {
            toast.success(t('settingsPage.notifications.reminderEnabled', 'Daily reminder enabled'));
        } else {
            toast.error(t('settingsPage.notifications.permissionDenied', 'Notification permission was denied'));
        }
    }, [enableReminder, reminderTimeInput, t]);

    const handleDisableReminder = useCallback(() => {
        disableReminder();
        toast.info(t('settingsPage.notifications.reminderDisabled', 'Daily reminder disabled'));
    }, [disableReminder, t]);

    const toggleSection = useCallback((sectionName) => {
        setOpenSections(prev => ({ ...prev, [sectionName]: !prev[sectionName] }));
    }, []);

    if (isLoadingSettings) {
        return <div className={styles.centeredStatus}><LoadingSpinner size="large" text={t('loaders.loadingSettings')} /></div>;
    }

    return (
        <div className={styles.settingsPageContainer}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>{t('settingsPage.accountSettingsTitle')}</h1>
            </div>

            {/* Notifications Section */}
            <section className={styles.settingsCard}>
                <div className={styles.cardHeaderWithToggle} onClick={() => toggleSection('notifications')} role="button" tabIndex={0}>
                    <h2 className={styles.cardTitle}><FaBell className="inline mr-2" /> {t('settingsPage.notifications.title', 'Notifications')}</h2>
                    {openSections.notifications ? <FaChevronUp className={styles.toggleIconOpen} /> : <FaChevronDown className={styles.toggleIcon} />}
                </div>
                {openSections.notifications && (
                    <div className={styles.formSection}>
                        <p className={styles.cardSubtitle}>{t('settingsPage.notifications.subtitle', 'Manage your notification preferences')}</p>
                        
                        {/* Notification permission status */}
                        <div className={styles.actionRow}>
                            <div className={styles.actionDescription}>
                                <strong>{t('settingsPage.notifications.browserPermission', 'Browser Notification Permission')}</strong>
                                <p>
                                    {notifPermission === 'granted'
                                        ? t('settingsPage.notifications.permissionGranted', 'Permission granted ✓')
                                        : notifPermission === 'denied'
                                            ? t('settingsPage.notifications.permissionDenied', 'Permission denied — update your browser settings')
                                            : t('settingsPage.notifications.permissionPrompt', 'Click to enable notifications')
                                    }
                                </p>
                            </div>
                            {notifPermission !== 'granted' && notifPermission !== 'denied' && (
                                <div className={styles.actionButtonContainer}>
                                    <Button variant="secondary" onClick={requestPermission} leftIcon={<FaBell />}>
                                        {t('settingsPage.notifications.enableButton', 'Enable Notifications')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Daily reminder toggle */}
                        <div className={styles.actionRow}>
                            <div className={styles.actionDescription}>
                                <strong>{t('settingsPage.notifications.dailyReminder', 'Daily Reminder')}</strong>
                                <p>{t('settingsPage.notifications.dailyReminderDesc', 'Get a reminder to log your progress every day')}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {reminderEnabled ? (
                                    <>
                                        <span className="text-xs text-green-600 dark:text-green-400">
                                            {t('settingsPage.notifications.active', 'Active')}
                                        </span>
                                        <Button variant="destructive" size="small" onClick={handleDisableReminder}>
                                            {t('common.disable', 'Disable')}
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Input
                                            type="time"
                                            value={reminderTimeInput}
                                            onChange={(e) => setReminderTimeInput(e.target.value)}
                                            className="w-32"
                                        />
                                        <Button variant="primary" size="small" onClick={handleEnableReminder} disabled={notifPermission === 'denied'}>
                                            {t('common.enable', 'Enable')}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className={styles.settingsCard}>
                <div className={styles.cardHeaderWithToggle} onClick={() => toggleSection('appearance')} role="button" tabIndex={0}>
                    <h2 className={styles.cardTitle}>{t('settingsPage.appearance.title')}</h2>
                    {openSections.appearance ? <FaChevronUp className={styles.toggleIconOpen} /> : <FaChevronDown className={styles.toggleIcon} />}
                </div>
                {openSections.appearance && (
                    <>
                        <p className={styles.cardSubtitle}>{t('settingsPage.appearance.subtitle')}</p>
                        <div className={styles.formSection}>
                            <FormGroup label={t('settingsPage.appearance.themeLabel')} htmlFor="theme-preference">
                                <Input type="select" id="theme-preference" name="themePreference" value={localSettingsData.themePreference || 'system'} onChange={handleInputChange}>
                                    <option value="light">{t('theme.light')}</option>
                                    <option value="dark">{t('theme.dark')}</option>
                                    <option value="system">{t('theme.system')}</option>
                                </Input>
                            </FormGroup>
                            <FormGroup label={t('settingsPage.appearance.languageLabel')} htmlFor="language">
                                <Input type="select" id="language" name="language" value={localSettingsData.language || 'es'} onChange={handleLanguageChange}>
                                    <option value="es">{t('language.es')}</option>
                                    <option value="en">{t('language.en')}</option>
                                </Input>
                            </FormGroup>
                            <FormGroup label={t('settingsPage.appearance.dateFormatLabel')} htmlFor="date-format">
                                <Input type="select" id="date-format" name="dateFormat" value={localSettingsData.dateFormat || 'dd/MM/yyyy'} onChange={handleInputChange}>
                                    <option value="dd/MM/yyyy">DD/MM/YYYY</option>
                                    <option value="MM/dd/yyyy">MM/DD/YYYY</option>
                                    <option value="yyyy-MM-dd">YYYY-MM-DD</option>
                                </Input>
                            </FormGroup>
                        </div>
                    </>
                )}
            </section>

            <section className={styles.settingsCard}>
                <div className={styles.cardHeaderWithToggle} onClick={() => toggleSection('changePassword')} role="button" tabIndex={0}>
                    <h2 className={styles.cardTitle}>{t('settingsPage.password.title')}</h2>
                    {openSections.changePassword ? <FaChevronUp className={styles.toggleIconOpen} /> : <FaChevronDown className={styles.toggleIcon} />}
                </div>
                {openSections.changePassword && (
                    <>
                        <p className={styles.cardSubtitle}>{t('settingsPage.password.subtitle')}</p>
                        <form onSubmit={handleChangePassword}>
                            <div className={styles.formSection}>
                                <FormGroup label={t('settingsPage.password.currentLabel')} htmlFor="current-password">
                                    <Input type={showCurrentPassword ? "text" : "password"} id="current-password" name="currentPassword" value={currentPassword} onChange={handlePasswordInputChange} actionIcon={showCurrentPassword ? <FaEyeSlash /> : <FaEye />} onActionClick={() => setShowCurrentPassword(!showCurrentPassword)} actionIconAriaLabel={t(showCurrentPassword ? 'settingsPage.password.toggleAria.hideCurrent' : 'settingsPage.password.toggleAria.showCurrent')} autoComplete="current-password" />
                                </FormGroup>
                                <FormGroup label={t('settingsPage.password.newLabel')} htmlFor="new-password">
                                    <Input type={showNewPassword ? "text" : "password"} id="new-password" name="newPassword" value={newPassword} onChange={handlePasswordInputChange} actionIcon={showNewPassword ? <FaEyeSlash /> : <FaEye />} onActionClick={() => setShowNewPassword(!showNewPassword)} actionIconAriaLabel={t(showNewPassword ? 'settingsPage.password.toggleAria.hideNew' : 'settingsPage.password.toggleAria.showNew')} autoComplete="new-password" />
                                </FormGroup>
                                <FormGroup label={t('settingsPage.password.confirmLabel')} htmlFor="confirm-new-password">
                                    <Input type={showConfirmNewPassword ? "text" : "password"} id="confirm-new-password" name="confirmNewPassword" value={confirmNewPassword} onChange={handlePasswordInputChange} actionIcon={showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />} onActionClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} actionIconAriaLabel={t(showConfirmNewPassword ? 'settingsPage.password.toggleAria.hideConfirm' : 'settingsPage.password.toggleAria.showConfirm')} autoComplete="new-password" />
                                </FormGroup>
                                {passwordFormError && <p className={`${styles.formErrorMessage} ${styles.sectionFormError}`}>{passwordFormError}</p>}
                                <div className={styles.passwordChangeActions}>
                                    <Button type="submit" variant="primary" isLoading={isSavingPassword} disabled={isSavingPassword}>{t('settingsPage.password.changeButton')}</Button>
                                </div>
                            </div>
                        </form>
                    </>
                )}
            </section>

            <section className={styles.settingsCard}>
                <div className={styles.cardHeaderWithToggle} onClick={() => toggleSection('dataAccount')} role="button" tabIndex={0}>
                    <h2 className={styles.cardTitle}>{t('settingsPage.data.title')}</h2>
                    {openSections.dataAccount ? <FaChevronUp className={styles.toggleIconOpen} /> : <FaChevronDown className={styles.toggleIcon} />}
                </div>

                {openSections.dataAccount && (
                    <div className={styles.formSection}>
                        {/* Export Data - JSON */}
                        <div className={styles.actionRow}>
                            <div className={styles.actionDescription}>
                                <strong>{t('settingsPage.data.exportLabel')}</strong>
                                <p>{t('settingsPage.data.exportDescription')}</p>
                            </div>
                            <div className={styles.actionButtonContainer}>
                                <Button variant="secondary" onClick={handleExportData} isLoading={isProcessingDataAction} disabled={isProcessingDataAction} leftIcon={<FaDownload />} >
                                    {t('settingsPage.data.exportButton')}
                                </Button>
                            </div>
                        </div>

                        {/* Export Objectives as CSV */}
                        <div className={styles.actionRow}>
                            <div className={styles.actionDescription}>
                                <strong>{t('settingsPage.data.exportCSV', 'Export Objectives as CSV')}</strong>
                                <p>{t('settingsPage.data.exportCSVDesc', 'Download your objectives as a CSV file')}</p>
                            </div>
                            <div className={styles.actionButtonContainer}>
                                <Button variant="secondary" onClick={handleExportCSV} isLoading={isProcessingDataAction} disabled={isProcessingDataAction} leftIcon={<FaFileExport />}>
                                    CSV
                                </Button>
                                <Button variant="secondary" onClick={handleExportJSON} isLoading={isProcessingDataAction} disabled={isProcessingDataAction} leftIcon={<FaFileExport />}>
                                    JSON
                                </Button>
                            </div>
                        </div>

                        {/* Delete Account */}
                        <div className={`${styles.actionRow} ${styles.actionRowDestructive}`}>
                            <div className={styles.actionDescription}>
                                <strong>{t('settingsPage.data.deleteLabel')}</strong>
                                <p>{t('settingsPage.data.deleteDescription')}</p>
                            </div>
                            <div className={styles.actionButtonContainer}>
                                <Button variant="destructive" onClick={handleDeleteAccount} isLoading={isProcessingDataAction} disabled={isProcessingDataAction} leftIcon={<FaTrash />} >
                                    {t('settingsPage.data.deleteButton')}
                                </Button>
                            </div>
                        </div>
                        
                        {dataAccountError && <p className={`${styles.formErrorMessage} ${styles.sectionFormError}`}>{dataAccountError}</p>}
                    </div>
                )}
            </section>
            <div>
            {isDirty && (
                    <div className={styles.globalActionsContainer}>
                        <Button variant="secondary" onClick={handleRevertChanges} disabled={isSaving}>
                            {t('common.revert')}
                        </Button>
                        <Button variant="primary" onClick={handleSaveAllSettings} isLoading={isSaving} disabled={isSaving}>
                            {t('common.saveChanges')}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default SettingsPage;
