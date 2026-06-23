// frontend/app/src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import type { User } from '../types/User';

interface AuthContextType {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (newToken: string, userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// 15 minutes of inactivity for automatic logout
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
    const [user, setUser] = useState<User | null>(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    });
    const [isLoading, setIsLoading] = useState(true); // Solo para la carga inicial de localStorage
    const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const logout = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    }, []);

    const login = useCallback((newToken: string, userData: User) => {
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
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
            if (token) {
                inactivityTimerRef.current = setTimeout(() => {
                    toast.warn('Tu sesión ha expirado por inactividad.');
                    logout();
                }, INACTIVITY_TIMEOUT_MS);
            }
        };

        const activityEvents = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'] as const;
        if (token) {
            activityEvents.forEach(event => window.addEventListener(event, resetTimer, { passive: true }));
            resetTimer(); // Inicia el temporizador
        }

        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
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

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
    }
    return context;
};
