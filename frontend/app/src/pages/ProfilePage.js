// frontend/app/src/pages/ProfilePage.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormGroup from '../components/ui/FormGroup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { formatDateByPreference } from '../utils/dateUtils';
import { useSettings } from '../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import LevelBadge from '../components/gamification/LevelBadge';
import AchievementList from '../components/gamification/AchievementList';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function ProfilePage() {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [statsData, setStatsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formError, setFormError] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [achievementData, setAchievementData] = useState(null);

    const mapApiDataToState = (apiData) => ({
        name: apiData.username || '',
        email: apiData.email || '',
        phone: apiData.phone || '',
        location: apiData.location || '',
        bio: apiData.bio || '',
        avatarUrl: apiData.avatarUrl || '',
        memberSince: apiData.createdAt,
    });

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [profileResponse, statsResponse, streakRes] = await Promise.allSettled([
                apiService.getUserProfile(),
                apiService.getUserProfileStats(),
                apiService.getStreak(),
            ]);

            const profileData = profileResponse.status === 'fulfilled' ? profileResponse.value?.data : null;
            const userStats = statsResponse.status === 'fulfilled' ? statsResponse.value?.data : null;
            const streakData = streakRes.status === 'fulfilled' ? streakRes.value?.data?.streak : null;

            if (!profileData || !userStats) {
                throw new Error(t('errors.profileLoadError'));
            }

            const normalizedProfile = mapApiDataToState(profileData);
            setUserData(normalizedProfile);
            setFormData(normalizedProfile);
            setAvatarPreview(normalizedProfile.avatarUrl);
            setStatsData(userStats);

            setAchievementData({
                objectives: userStats?.objectives || [],
                progressCount: userStats?.totalProgressEntries || 0,
                streakCount: streakData?.streakCount || 0,
                analysisVisits: parseInt(localStorage.getItem('goalmaster_analysis_visits') || '0', 10),
            });

        } catch (err) {
            setError(err.message || t('errors.profileLoadError'));
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleEditClick = () => {
        setFormError(null);
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setIsEditMode(false);
        setFormError(null);
        setSelectedAvatarFile(null);
        setAvatarPreview(userData.avatarUrl);
        setFormData(userData);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);

        const submissionData = new FormData();
        submissionData.append('username', formData.name);
        submissionData.append('phone', formData.phone || '');
        submissionData.append('location', formData.location || '');
        submissionData.append('bio', formData.bio || '');

        if (selectedAvatarFile) {
            submissionData.append('avatar', selectedAvatarFile);
        }

        try {
            const updatedProfileResponse = await apiService.updateUserProfile(submissionData);
            const updatedProfile = updatedProfileResponse.data;

            const normalizedUserData = mapApiDataToState(updatedProfile);

            setUserData(normalizedUserData);
            setFormData(normalizedUserData);
            setSelectedAvatarFile(null);
            setAvatarPreview(normalizedUserData.avatarUrl);

            toast.success(t('toast.profileUpdateSuccess'));
            setIsEditMode(false);
        } catch (err) {
            const errorMessage = err.message || t('toast.profileUpdateError', { error: 'Unknown error' });
            setFormError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAvatarFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error(t('toast.avatarUpload.fileTooLarge'));
                return;
            }
            if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
                toast.error(t('toast.avatarUpload.invalidFormat'));
                return;
            }
            setSelectedAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    if (isLoading) return <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-[var(--muted-foreground)]"><LoadingSpinner size="large" text={t('loaders.loadingProfile')} /></div>;
    if (error) return <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-[var(--destructive)]">{error}</div>;

    const formattedMemberSince = userData?.memberSince ? formatDateByPreference(userData.memberSince, settings.dateFormat, settings.language) : t('common.notAvailable');

    return (
        <motion.div
            className="p-6 flex flex-col gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            <motion.header
                className="bg-[var(--card)] p-6 rounded-[var(--radius-lg)] flex items-center gap-6 shadow-[var(--shadow-md)] flex-wrap"
                variants={sectionVariants}
            >
                <motion.div
                    className="relative flex flex-col items-center gap-3 mb-4 flex-shrink-0"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, type: 'spring', stiffness: 200 }}
                >
                     {avatarPreview ? <img src={avatarPreview} alt={t('profilePage.avatarAlt', { name: formData.name })} className="w-[120px] h-[120px] rounded-full object-cover border-4 border-[var(--primary-soft-bg,color-mix(in_srgb,var(--primary)_15%,transparent))] shadow-[var(--shadow-md)]" /> : <FaUserCircle className="text-[120px] text-[var(--muted)] border-4 border-[var(--border-ultralight,var(--border))] rounded-full p-1 bg-[var(--background)]" />}
                     {isEditMode && (
                        <Button size="small" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-xs !px-3 !py-[0.4rem] w-auto max-w-[150px] text-center" disabled={isSubmitting}>{t('profilePage.selectPhoto')}</Button>
                    )}
                </motion.div>
                <div className="flex-grow">
                    <h1 className="text-[1.75rem] font-bold text-[var(--foreground)] m-0 break-words">{isEditMode ? formData.name : userData.name}</h1>
                    <p className="text-sm text-[var(--muted-foreground)] my-1 flex items-center gap-2 break-all"><FaEnvelope /> {userData.email}</p>
                    {!isEditMode && userData.location && <p className="text-sm text-[var(--muted-foreground)] my-1 flex items-center gap-2 break-all"><FaMapMarkerAlt /> {userData.location}</p>}
                    {!isEditMode && userData.phone && <p className="text-sm text-[var(--muted-foreground)] my-1 flex items-center gap-2 break-all"><FaPhone /> {userData.phone}</p>}
                    <p className="text-sm text-[var(--muted-foreground)] my-1 flex items-center gap-2 break-all"><FaCalendarAlt /> {t('profilePage.memberSince', { date: formattedMemberSince })}</p>
                </div>
                <div className="ml-auto self-start">
                    {isEditMode ? (
                        <div className="flex gap-4">
                            <Button variant="buttonOutline" onClick={handleCancelEdit} disabled={isSubmitting} leftIcon={<FaTimes />}>{t('common.cancel')}</Button>
                            <Button type="submit" form="profile-form" variant="primary" isLoading={isSubmitting} disabled={isSubmitting} leftIcon={<FaSave />}>{t('common.saveChanges')}</Button>
                        </div>
                    ) : (
                        <Button variant="outline" onClick={handleEditClick} leftIcon={<FaEdit />}>{t('profilePage.editProfile')}</Button>
                    )}
                </div>
            </motion.header>

            <motion.div
                className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                <motion.section variants={sectionVariants} className="bg-[var(--card)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] border border-[var(--border)] h-fit">
                     <h2 className="text-[1.3rem] font-semibold text-[var(--foreground)] m-0 mb-2">{t('profilePage.cards.personalInfo.title')}</h2>
                    {isEditMode ? (
                        <form id="profile-form" onSubmit={handleSaveChanges}>
                            <FormGroup label={t('profilePage.labels.fullName')} htmlFor="name">
                                <Input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} />
                            </FormGroup>
                            <FormGroup label={t('profilePage.labels.email')} htmlFor="email">
                                <Input type="email" id="email" name="email" value={formData.email} readOnly disabled title={t('profilePage.emailReadonly')} />
                            </FormGroup>
                            <FormGroup label={t('profilePage.labels.phone')} htmlFor="phone">
                                <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} placeholder={t('profilePage.placeholders.phone')} />
                            </FormGroup>
                            <FormGroup label={t('profilePage.labels.location')} htmlFor="location">
                                <Input type="text" id="location" name="location" value={formData.location} onChange={handleInputChange} placeholder={t('profilePage.placeholders.location')} />
                            </FormGroup>
                            <FormGroup label={t('profilePage.labels.bio')} htmlFor="bio">
                                <textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className="w-full px-3 py-[0.6rem] border border-[var(--border)] rounded-[var(--radius-sm)] text-sm bg-[var(--input-bg,var(--card))] text-[var(--foreground)] min-h-[100px] resize-y font-inherit leading-relaxed focus:outline-none focus:border-[var(--ring)] focus:shadow-[0_0_0_2px_color-mix(in_srgb,var(--ring)_25%,transparent)]" rows="4" placeholder={t('profilePage.placeholders.bio')} />
                            </FormGroup>
                            {formError && <p className="text-[var(--destructive)] text-sm mt-4 text-left">{formError}</p>}
                        </form>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <div className="sm:[&:nth-child(5)]:col-span-full">
                                <label className="block text-xs text-[var(--muted-foreground)] mb-1 font-medium">{t('profilePage.labels.fullName')}</label>
                                <p className="text-sm text-[var(--foreground)] break-words m-0">{userData.name || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--muted-foreground)] mb-1 font-medium">{t('profilePage.labels.email')}</label>
                                <p className="text-sm text-[var(--foreground)] break-words m-0">{userData.email || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--muted-foreground)] mb-1 font-medium">{t('profilePage.labels.phone')}</label>
                                <p className="text-sm text-[var(--foreground)] break-words m-0">{userData.phone || '-'}</p>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--muted-foreground)] mb-1 font-medium">{t('profilePage.labels.location')}</label>
                                <p className="text-sm text-[var(--foreground)] break-words m-0">{userData.location || '-'}</p>
                            </div>
                            <div className="sm:col-span-full">
                                <label className="block text-xs text-[var(--muted-foreground)] mb-1 font-medium">{t('profilePage.labels.bio')}</label>
                                <p className="text-sm text-[var(--foreground)] break-words m-0 leading-relaxed whitespace-pre-wrap">{userData.bio || t('profilePage.noBio')}</p>
                            </div>
                        </div>
                    )}
                </motion.section>
                <aside className="flex flex-col gap-6">
                    {statsData && (
                        <motion.section variants={sectionVariants} className="bg-[var(--card)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] border border-[var(--border)] h-fit">
                            <h2 className="text-[1.3rem] font-semibold text-[var(--foreground)] m-0 mb-2">{t('profilePage.cards.level.title', 'Level & XP')}</h2>
                            <LevelBadge
                                stats={{
                                    completedObjectives: statsData.completed || 0,
                                    streakCount: 0,
                                    achievementsCount: 0,
                                }}
                            />
                        </motion.section>
                    )}
                    {statsData && (
                        <motion.section variants={sectionVariants} className="bg-[var(--card)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] border border-[var(--border)] h-fit">
                            <h2 className="text-[1.3rem] font-semibold text-[var(--foreground)] m-0 mb-2">{t('profilePage.cards.stats.title')}</h2>
                            <ul className="list-none p-0 m-0">
                                <li className="flex justify-between items-center py-[0.6rem] text-sm border-b border-[var(--border-ultralight,var(--border))] last:border-b-0">
                                    <span>{t('profilePage.cards.stats.total')}</span>
                                    <span className="font-semibold">{statsData.totalObjectives}</span>
                                </li>
                                <li className="flex justify-between items-center py-[0.6rem] text-sm border-b border-[var(--border-ultralight,var(--border))] last:border-b-0">
                                    <span>{t('profilePage.cards.stats.completed')}</span>
                                    <span className="font-semibold text-[var(--success)]">{statsData.completed}</span>
                                </li>
                                <li className="flex justify-between items-center py-[0.6rem] text-sm border-b border-[var(--border-ultralight,var(--border))] last:border-b-0">
                                    <span>{t('profilePage.cards.stats.inProgress')}</span>
                                    <span className="font-semibold text-[var(--primary)]">{statsData.inProgress}</span>
                                </li>
                                <li className="flex justify-between items-center py-[0.6rem] text-sm border-b border-[var(--border-ultralight,var(--border))] last:border-b-0">
                                    <span>{t('profilePage.cards.stats.successRate')}</span>
                                    <span className="font-semibold text-[var(--primary)]">{statsData.successRate}%</span>
                                </li>
                            </ul>
                        </motion.section>
                    )}
                    {achievementData && (
                        <motion.section variants={sectionVariants} className="bg-[var(--card)] rounded-[var(--radius-md)] p-6 shadow-[var(--shadow-sm)] border border-[var(--border)] h-fit">
                            <h2 className="text-[1.3rem] font-semibold text-[var(--foreground)] m-0 mb-2">{t('profilePage.cards.achievements.title', 'Achievements')}</h2>
                            <AchievementList userData={achievementData} />
                        </motion.section>
                    )}
                </aside>
            </motion.div>
            <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" ref={fileInputRef} onChange={handleAvatarFileChange} style={{ display: 'none' }} id="avatarUploadInput" />
        </motion.div>
    );
}

export default ProfilePage;
