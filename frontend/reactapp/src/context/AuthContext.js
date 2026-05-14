// frontend/reactapp/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

// 15 minutes of inactivity for automatic logout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true); // Solo para la carga inicial de localStorage
    const inactivityTimerRef = useRef(null);

    const logout = useCallback(() => {
        clearTimeout(inactivityTimerRef.current);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
        // apiService.logout() is optional here — the client is already logged out.
        // apiService will handle any necessary cleanup if the user makes another request.
    }, []);

    const login = useCallback((newToken, userData) => {
        setToken(newToken);
        setUser(userData);
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
    }, []);

    // Carga inicial del estado desde localStorage
    useEffect(() => {
        setIsLoading(false);
    }, []);

    // Listener para el evento de logout global
    useEffect(() => {
        window.addEventListener('logoutUser', logout);
        return () => window.removeEventListener('logoutUser', logout);
    }, [logout]);

    // Inactivity timer management
    useEffect(() => {
        const resetTimer = () => {
            clearTimeout(inactivityTimerRef.current);
            if (token) {
                inactivityTimerRef.current = setTimeout(() => {
                    toast.warn('Tu sesión ha expirado por inactividad.');
                    logout();
                }, INACTIVITY_TIMEOUT_MS);
            }
        };

        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        if (token) {
            activityEvents.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
            resetTimer(); // Inicia el temporizador
        }

        return () => {
            clearTimeout(inactivityTimerRef.current);
            activityEvents.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [token, logout]);

    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
    }), [token, user, isLoading, login, logout]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
};