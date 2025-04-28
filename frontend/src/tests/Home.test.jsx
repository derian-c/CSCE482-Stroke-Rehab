import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../pages/Home';
import { useAuth0 } from '@auth0/auth0-react';

// Mock the auth0 hook
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

describe('Home Component', () => {
  const mockLoginWithRedirect = vi.fn();
  const mockLogout = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders the login page correctly when user is not authenticated', () => {
    // Mock Auth0 for unauthenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    render(<Home />);
    
    // Check for the healthcare title
    expect(screen.getByText(/Houston Methodist/i)).toBeInTheDocument();
    expect(screen.getByText(/LIVE Lab/i)).toBeInTheDocument();
    
    // Check for the login button
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
    
    // Check for the information for new patients
    expect(screen.getByText(/New patient\?/i)).toBeInTheDocument();
  });
  
  it('shows logout button when user is authenticated', () => {
    // Mock Auth0 for authenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    render(<Home />);
    
    // Check for the logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    expect(logoutButton).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
  });
  
  it('calls loginWithRedirect when login button is clicked', () => {
    // Mock Auth0 for unauthenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    render(<Home />);
    
    // Click the login button
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Check if loginWithRedirect was called
    expect(mockLoginWithRedirect).toHaveBeenCalled();
  });
  
  it('calls logout when logout button is clicked', () => {
    // Mock Auth0 for authenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    render(<Home />);
    
    // Click the logout button
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);
    
    // Check if logout was called with the correct params
    expect(mockLogout).toHaveBeenCalledWith({ logoutParams: { returnTo: window.location.origin } });
  });
  
  it('displays a message when homeMessage prop is provided', () => {
    // Mock Auth0 for authenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    const testMessage = 'Test home message';
    render(<Home homeMessage={testMessage} />);
    
    // Check if the message is displayed
    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });
  
  it('does not display a message when homeMessage prop is not provided', () => {
    // Mock Auth0 for authenticated user
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      loginWithRedirect: mockLoginWithRedirect,
      logout: mockLogout
    });
    
    render(<Home />);
    
    // Check that there's no empty message element
    const messageElements = screen.queryAllByText('');
    const hasEmptyMessage = messageElements.some(element => 
      element.classList.contains('text-red-600')
    );
    expect(hasEmptyMessage).toBe(false);
  });
});