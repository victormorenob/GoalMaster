// frontend/app/src/components/auth/ProtectedRoute.js
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Make sure the path is correct
import LoadingSpinner from "../ui/LoadingSpinner"; 

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth(); // Se usa 'isLoading' del AuthContext
    const location = useLocation(); // Hook to get the current location

    // Show a loading indicator while verifying initial authentication state
    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                // Altura calculada para ocupar el espacio disponible menos la altura del header (si existe)
                height: 'calc(100vh - var(--app-header-height, 60px))' 
            }}>
                <LoadingSpinner size="large" />
            </div>
        );
    }

    // If the user is not authenticated (and loading has finished), redirect to login page
    if (!isAuthenticated) {
        // Se pasa 'state={{ from: location }}' para que, tras un login exitoso,
        // so the user can be redirected back to the page they were trying to access.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If the user is authenticated, render the nested route content (Outlet)
    return <Outlet />;
};

export default ProtectedRoute;