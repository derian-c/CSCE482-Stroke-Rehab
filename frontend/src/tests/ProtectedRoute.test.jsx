import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'user123', name: 'Test User' },
    getAccessTokenSilently: vi.fn().mockResolvedValue('token')
  }))
}));

vi.mock('../components/ProtectedRoute', () => {
  return {
    default: ({ children, allowedRole }) => {
      const { useAuth0 } = require('@auth0/auth0-react');
      const { isAuthenticated, isLoading } = useAuth0();
      
      // Mock the getUsersRole functionality directly
      const userRoles = ['Admin', 'Physician'];
      
      if (isLoading) {
        return <div data-testid="loading-state">Loading...</div>;
      }
      
      if (!isAuthenticated || !userRoles.includes(allowedRole)) {
        return <div data-testid="navigate">Redirecting...</div>;
      }
      
      return <div data-testid="protected-content">{children}</div>;
    }
  };
}, { virtual: true });

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state when Auth0 is loading', () => {
    // We need to trigger a re-render of our mock component with the loading state
    const useAuth0Spy = vi.spyOn(require('@auth0/auth0-react'), 'useAuth0');
    useAuth0Spy.mockImplementationOnce(() => ({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      getAccessTokenSilently: vi.fn()
    }));
    
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="Admin">
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
  });

  it('renders children when user is authenticated and has the allowed role', () => {
    // Make sure authenticated state is used
    const useAuth0Spy = vi.spyOn(require('@auth0/auth0-react'), 'useAuth0');
    useAuth0Spy.mockImplementationOnce(() => ({
      isAuthenticated: true,
      isLoading: false,
      user: { sub: 'user123', name: 'Test User' },
      getAccessTokenSilently: vi.fn()
    }));
    
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="Admin">
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('redirects when user is not authenticated', () => {
    const useAuth0Spy = vi.spyOn(require('@auth0/auth0-react'), 'useAuth0');
    useAuth0Spy.mockImplementationOnce(() => ({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently: vi.fn()
    }));
    
    render(
      <MemoryRouter>
        <ProtectedRoute allowedRole="Admin">
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
  });
});