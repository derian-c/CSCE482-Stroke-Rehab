import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuth0 } from '@auth0/auth0-react';
import { useSocket } from '../components/SocketProvider';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

vi.mock('../components/SocketProvider', () => ({
  useSocket: vi.fn()
}));

vi.mock('../components/ProtectedRoute', () => ({
  default: ({ children, allowedRole }) => (
    <div data-testid="protected-route" data-role={allowedRole}>
      {children}
    </div>
  )
}));

vi.mock('../pages/Home', () => ({
  default: ({ homeMessage }) => <div data-testid="home-page">{homeMessage || 'Home Page'}</div>
}));

vi.mock('../pages/PatientView', () => ({
  default: () => <div data-testid="patient-view">Patient View</div>
}));

vi.mock('../pages/AdminView', () => ({
  default: () => <div data-testid="admin-view">Admin View</div>
}));

vi.mock('../pages/PhysicianView', () => ({
  default: () => <div data-testid="physician-view">Physician View</div>
}));

vi.mock('../pages/ProviderView', () => ({
  default: () => <div data-testid="provider-view">Provider View</div>
}));

describe('App Component', () => {
  const mockSocket = { 
    on: vi.fn((event, callback) => {
      if (event === 'wait') {
        callback({ message: 'Please wait' });
      }
    }),
    off: vi.fn()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      getAccessTokenSilently: vi.fn(),
      loginWithRedirect: vi.fn(),
      logout: vi.fn()
    });
    
    useSocket.mockReturnValue(mockSocket);
  });
  
  it('includes Routes component for routing', () => {
    const { container } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(container.innerHTML).toContain('data-testid="home-page"');
  });
  
  it('sets up socket listeners for messaging', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    expect(mockSocket.on).toHaveBeenCalledWith('user_info', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('relogin', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('wait', expect.any(Function));
    
    expect(screen.getByTestId('home-page').textContent).toBe('Please wait');
  });
  
  it('cleans up socket listeners on unmount', () => {
    const { unmount } = render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );
    
    unmount();
    
    expect(mockSocket.off).toHaveBeenCalledWith('user_info', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('relogin', expect.any(Function));
    expect(mockSocket.off).toHaveBeenCalledWith('wait', expect.any(Function));
  });
});