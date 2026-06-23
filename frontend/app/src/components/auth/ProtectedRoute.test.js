import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn(),
}));

const { useAuth } = require('../../context/AuthContext');

describe('ProtectedRoute', () => {
    it('shows loader while auth is loading', () => {
        useAuth.mockReturnValue({ isAuthenticated: false, isLoading: true });
        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('renders outlet when authenticated', () => {
        useAuth.mockReturnValue({ isAuthenticated: true, isLoading: false });
        render(
            <MemoryRouter>
                <ProtectedRoute />
            </MemoryRouter>
        );
        expect(screen.getByTestId('outlet')).toBeInTheDocument();
    });
});
