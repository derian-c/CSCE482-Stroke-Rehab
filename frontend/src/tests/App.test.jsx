import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import { useAuth0 } from '@auth0/auth0-react';

vi.mock('../pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));

vi.mock('../pages/PatientView', () => ({
  default: () => <div data-testid="patient-page">Patient Page</div>
}));

vi.mock('../pages/AdminView', () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>
}));

vi.mock('../pages/PhysicianView', () => ({
  default: () => <div data-testid="physician-page">Physician Page</div>
}));

vi.mock('../pages/ProviderView', () => ({
  default: () => <div data-testid="provider-page">Provider Page</div>
}));

const renderWithRouter = (ui, { route = '/', authenticated = true } = {}) => {
  useAuth0.mockReturnValue({
    isAuthenticated: authenticated,
    isLoading: false,
    user: authenticated ? { sub: 'user123', name: 'Test User' } : null,
    loginWithRedirect: vi.fn(),
    logout: vi.fn()
  });

  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>
  );
};

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders home page on default route', () => {
    renderWithRouter(<App />, { route: '/' });
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('allows access to patient view when authenticated', () => {
    renderWithRouter(<App />, { route: '/patient', authenticated: true });
    expect(screen.getByTestId('patient-page')).toBeInTheDocument();
  });

  it('allows access to admin view when authenticated', () => {
    renderWithRouter(<App />, { route: '/admin', authenticated: true });
    expect(screen.getByTestId('admin-page')).toBeInTheDocument();
  });

  it('allows access to physician view when authenticated', () => {
    renderWithRouter(<App />, { route: '/physician', authenticated: true });
    expect(screen.getByTestId('physician-page')).toBeInTheDocument();
  });

  it('allows access to provider view when authenticated', () => {
    renderWithRouter(<App />, { route: '/provider', authenticated: true });
    expect(screen.getByTestId('provider-page')).toBeInTheDocument();
  });

  it('redirects to home when trying to access protected route while not authenticated', () => {
    renderWithRouter(<App />, { route: '/patient', authenticated: false });
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByTestId('patient-page')).not.toBeInTheDocument();
  });

  it('shows loading state when Auth0 is loading', () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      loginWithRedirect: vi.fn(),
      logout: vi.fn()
    });

    render(
      <MemoryRouter initialEntries={['/patient']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});