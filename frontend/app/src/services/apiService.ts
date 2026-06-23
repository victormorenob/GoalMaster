// frontend/app/src/services/apiService.ts
import axios, { AxiosInstance } from "axios";
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
});

let isSessionExpiredMessageShown = false;

// Interceptor to add the authentication token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para manejar globalmente las respuestas y los errores
axiosInstance.interceptors.response.use(
    (response) => response.data, // Devuelve directamente la data de la respuesta
    async (error) => {
        const { config: originalRequest, response } = error;

        if (!response) {
            toast.error('Error de red. No se pudo conectar con el servidor.');
            return Promise.reject(error);
        }

        const { status, data } = response;
        const isLoginRequest = originalRequest.url.endsWith('/auth/login');

        if ((status === 401 || status === 403) && !isLoginRequest && !originalRequest._retry) {
            originalRequest._retry = true;
            if (!isSessionExpiredMessageShown) {
                isSessionExpiredMessageShown = true;
                toast.error('Tu sesiÃ³n ha expirado. Por favor, inicia sesiÃ³n de nuevo.');
                window.dispatchEvent(new CustomEvent('logoutUser'));
                setTimeout(() => { isSessionExpiredMessageShown = false; }, 5000);
            }
        }

        const errorMessage = data?.message || 
                             (Array.isArray(data?.errors) ? data.errors.map((e: { msg: string }) => e.msg).join(', ') : 'OcurriÃ³ un error inesperado.');
        
        const errorToThrow = new Error(errorMessage) as Error & { data: unknown; status: number };
        errorToThrow.data = data;
        errorToThrow.status = status;
        
        return Promise.reject(errorToThrow);
    }
);


const api = {
    // Auth
    register: (userData: Record<string, unknown>) => axiosInstance.post('/auth/register', userData),
    login: (credentials: { email: string; password: string }) => axiosInstance.post('/auth/login', credentials),
    logout: () => axiosInstance.post('/auth/logout'),

    // Objectives
    getObjectives: (filters?: Record<string, unknown>) => axiosInstance.get('/objectives', { params: filters }),
    getObjectiveById: (id: number | string) => axiosInstance.get(`/objectives/${id}`),
    createObjective: (data: Record<string, unknown>) => axiosInstance.post('/objectives', data),
    updateObjective: (id: number | string, data: Record<string, unknown>) => axiosInstance.put(`/objectives/${id}`, data),
    deleteObjective: (id: number | string) => axiosInstance.delete(`/objectives/${id}`),
    unarchiveObjective: (id: number | string) => axiosInstance.patch(`/objectives/${id}/unarchive`),

    // Dashboard
    getDashboardSummary: () => axiosInstance.get('/dashboard/summary-stats'),
    getRecentObjectives: (limit: number = 4) => axiosInstance.get(`/dashboard/recent-objectives?limit=${limit}`),
    getRecentActivities: (limit: number = 5) => axiosInstance.get(`/dashboard/recent-activities?limit=${limit}`),

    // Analysis
    getAnalysisSummary: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/summary', { params }),
    getCategoryDistribution: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/category-distribution', { params }),
    getObjectiveStatusDistribution: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/status-distribution', { params }),
    getMonthlyProgress: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/monthly-progress', { params }),
    getObjectivesProgressChartData: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/objective-progress-chart-data', { params }),
    getRankedObjectives: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/ranked-objectives', { params }),
    getCategoryAverageProgress: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/category-average-progress', { params }),
    getDetailedObjectivesByCategory: (params?: Record<string, unknown>) => axiosInstance.get('/analysis/detailed-by-category', { params }),
    
    // Profile
    getUserProfile: () => axiosInstance.get('/profile'),
    updateUserProfile: (formData: FormData | Record<string, unknown>) => axiosInstance.patch('/profile', formData),
    getUserProfileStats: () => axiosInstance.get('/profile/stats'),

    // Settings
    getUserSettings: () => axiosInstance.get('/settings'),
    updateUserSettings: (data: Record<string, unknown>) => axiosInstance.put('/settings', data),
    changePassword: (data: Record<string, unknown>) => axiosInstance.put('/settings/change-password', data),
    exportUserData: () => axiosInstance.get('/settings/export-data'),
    deleteAccount: () => axiosInstance.delete('/settings/account'),

    // Tags, templates, streak, AI
    getTags: () => axiosInstance.get('/tags'),
    createTag: (data: Record<string, unknown>) => axiosInstance.post('/tags', data),
    updateTag: (id: number | string, data: Record<string, unknown>) => axiosInstance.put(/tags/, data),
    deleteTag: (id: number | string) => axiosInstance.delete(/tags/),

    getTemplates: (category?: string) => axiosInstance.get('/templates', { params: category ? { category } : {} }),
    getStreak: () => axiosInstance.get('/streak'),
    updateStreak: () => axiosInstance.post('/streak/update'),
    sendChatMessage: (message: string) => axiosInstance.post('/ai/chat', { message }),
    getAiSuggestions: (context: Record<string, unknown>) => axiosInstance.post('/ai/suggest', { context }),};

export default api;
