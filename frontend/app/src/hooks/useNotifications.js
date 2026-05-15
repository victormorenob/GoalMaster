// frontend/app/src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook for managing browser notifications.
 * Uses the Notification API directly (no server-side push required).
 */
const useNotifications = () => {
    const [permission, setPermission] = useState(Notification.permission);
    const [reminderTime, setReminderTime] = useState(() => {
        return localStorage.getItem('goalmaster_reminder_time') || null;
    });
    const [reminderEnabled, setReminderEnabled] = useState(() => {
        return localStorage.getItem('goalmaster_reminder_enabled') === 'true';
    });
    const intervalRef = useRef(null);

    /**
     * Request notification permission from the user.
     * @returns {Promise<boolean>} Whether permission was granted.
     */
    const requestPermission = useCallback(async () => {
        if (!('Notification' in window)) {
            console.warn('This browser does not support notifications.');
            return false;
        }

        if (Notification.permission === 'granted') {
            setPermission('granted');
            return true;
        }

        if (Notification.permission === 'denied') {
            console.warn('Notification permission was denied.');
            return false;
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            return result === 'granted';
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            return false;
        }
    }, []);

    /**
     * Send a notification using the Notification API.
     * @param {string} title - Notification title.
     * @param {string} body - Notification body text.
     */
    const sendNotification = useCallback((title, body) => {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        try {
            new Notification(title, {
                body,
                icon: '/logo192.png',
            });
        } catch (err) {
            console.error('Error sending notification:', err);
        }
    }, []);

    /**
     * Send a daily reminder notification.
     */
    const sendDailyReminder = useCallback(() => {
        sendNotification(
            'GoalMaster',
            'Remember to log your progress today!'
        );
    }, [sendNotification]);

    /**
     * Enable daily reminders at a specific time.
     * @param {string} time - Time string in HH:MM format.
     */
    const enableReminder = useCallback(async (time) => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return false;

        setReminderTime(time);
        setReminderEnabled(true);
        localStorage.setItem('goalmaster_reminder_time', time);
        localStorage.setItem('goalmaster_reminder_enabled', 'true');

        // Schedule the interval check
        setupReminderInterval(time);

        return true;
    }, [requestPermission]);

    /**
     * Disable daily reminders.
     */
    const disableReminder = useCallback(() => {
        setReminderEnabled(false);
        localStorage.setItem('goalmaster_reminder_enabled', 'false');
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    /**
     * Set up interval to check if it's time for the daily reminder.
     */
    const setupReminderInterval = useCallback((time) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (!time) return;

        intervalRef.current = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            if (currentTime === time) {
                sendDailyReminder();
            }
        }, 60000); // Check every minute
    }, [sendDailyReminder]);

    // Initialize reminder interval on mount if enabled
    useEffect(() => {
        if (reminderEnabled && reminderTime) {
            setupReminderInterval(reminderTime);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [reminderEnabled, reminderTime, setupReminderInterval]);

    // Track analysis page visits (for achievement)
    useEffect(() => {
        const path = window.location.pathname;
        if (path.includes('/analisis') || path.includes('/analysis')) {
            const visits = parseInt(localStorage.getItem('goalmaster_analysis_visits') || '0', 10);
            localStorage.setItem('goalmaster_analysis_visits', String(visits + 1));
        }
    }, []);

    return {
        permission,
        reminderEnabled,
        reminderTime,
        requestPermission,
        sendNotification,
        sendDailyReminder,
        enableReminder,
        disableReminder,
    };
};

export default useNotifications;
