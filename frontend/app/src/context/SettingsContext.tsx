// frontend/app/src/context/SettingsContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useMemo
} from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import i18n from '../i18n'; // Importamos la instancia de i18n directamente

interface Settings {
    themePreference: 'light' | 'dark' | 'system';
    language: string;
    dateFormat: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    profileVisibility: string;
    showStatistics: boolean;
    allowAnalysis: boolean;
}

interface SettingsContextType {
    settings: Settings;
    isLoadingSettings: boolean;
    isApplyingTheme: boolean;
    updateSettings: (settingsToUpdate: Partial<Settings>) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === null) {
        throw new Error(i18n.t('devErrors.useSettingsMissingProvider'));
    }
    return context;
};

const defaultSettings: Settings = {
    themePreference: 'system',
    language: 'es',
    dateFormat: 'dd/MM/yyyy',
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    showStatistics: true,
    allowAnalysis: true,
};

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user } = useAuth();
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isApplyingTheme, setIsApplyingTheme] = useState(true);

    const applyThemeToDocument = useCallback((themePreference: Settings['themePreference']) => {
        const root = document.documentElement;
        let themeToApply: 'light' | 'dark' = themePreference === 'dark' ? 'dark' : 'light';

        if (themePreference === 'system') {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            themeToApply = systemPrefersDark ? 'dark' : 'light';
        }
        
        root.setAttribute('data-theme', themeToApply);
        localStorage.setItem('app-theme', themeToApply);
    }, []);

    const loadUserSettings = useCallback(async () => {
        if (isAuthenticated && user?.id) {
            setIsLoadingSettings(true);
            try {
                const response = await apiService.getUserSettings() as { preferences?: Partial<Settings> };
                const mergedSettings = { ...defaultSettings, ...(response?.preferences || {}) };
                setSettings(mergedSettings);
                applyThemeToDocument(mergedSettings.themePreference);
                if (i18n.language !== mergedSettings.language) {
                    await i18n.changeLanguage(mergedSettings.language);
                }
            } catch (error) {
                console.error("SettingsContext: Error loading user settings:", error);
                toast.error(i18n.t('toast.settingsLoadError'));
                setSettings(defaultSettings);
                applyThemeToDocument(defaultSettings.themePreference);
            } finally {
                setIsLoadingSettings(false);
                setIsApplyingTheme(false);
            }
        } else if (!isAuthenticated) {
            setSettings(defaultSettings);
            applyThemeToDocument('light');
            if (i18n.language !== defaultSettings.language) {
                await i18n.changeLanguage(defaultSettings.language);
            }
            setIsLoadingSettings(false);
            setIsApplyingTheme(false);
        }
    }, [isAuthenticated, user, applyThemeToDocument]);

    useEffect(() => {
        const savedTheme = localStorage.getItem('app-theme');
        const root = document.documentElement;
        setIsApplyingTheme(true);
        if (savedTheme) {
            root.setAttribute('data-theme', savedTheme);
        } else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
        }
        const timer = setTimeout(() => setIsApplyingTheme(false), 50); 
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        loadUserSettings();
    }, [loadUserSettings]);

    const updateSettings = useCallback(async (settingsToUpdate: Partial<Settings>): Promise<boolean> => {
        if (!isAuthenticated) {
            toast.error(i18n.t('toast.loginRequiredForSettings'));
            throw new Error(i18n.t('errors.notAuthenticated'));
        }
        try {
            const currentSettingsWithPayload = { ...settings, ...settingsToUpdate };
            setSettings(currentSettingsWithPayload);
            applyThemeToDocument(currentSettingsWithPayload.themePreference);

            await apiService.updateUserSettings(settingsToUpdate);
            return true;
        } catch (error) {
            console.error("SettingsContext: Error saving settings:", error);
            toast.error(error instanceof Error ? error.message : i18n.t('toast.settingsSaveError'));
            loadUserSettings();
            throw error;
        }
    }, [isAuthenticated, settings, loadUserSettings, applyThemeToDocument]);

    const contextValue = useMemo(() => ({
        settings,
        isLoadingSettings,
        updateSettings,
        isApplyingTheme
    }), [settings, isLoadingSettings, updateSettings, isApplyingTheme]);

    return (
        <SettingsContext.Provider value={contextValue}>
            {children}
        </SettingsContext.Provider>
    );
};
