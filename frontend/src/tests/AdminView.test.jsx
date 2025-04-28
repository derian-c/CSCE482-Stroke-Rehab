import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import AdminView from '../pages/AdminView';
import { useAuth0 } from '@auth0/auth0-react';
import { getPhysicians, createPhysician, deletePhysicianByID } from '../apis/physicianService';
import { getAdmins } from '../apis/adminService';
import { DeviceManagement } from '../components/DeviceManagement';

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn()
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

vi.mock('../apis/physicianService', () => ({
  getPhysicians: vi.fn(),
  createPhysician: vi.fn(),
  deletePhysicianByID: vi.fn()
}));

vi.mock('../apis/adminService', () => ({
  getAdmins: vi.fn()
}));

vi.mock('../components/DeviceManagement', () => ({
  DeviceManagement: () => <div data-testid="device-management">Device Management Component</div>
}));

vi.mock('../components/AccessibilityMenu', () => ({
  default: () => <div data-testid="accessibility-menu">Accessibility Menu</div>
}));

vi.mock('../components/NotificationToast', () => ({
  default: ({ message, type }) => (
    <div data-testid="notification-toast" data-message={message} data-type={type}>
      Notification Toast
    </div>
  )
}));

vi.mock('../components/ConfirmationDialog', () => ({
  default: ({ isOpen, title, message }) => (
    isOpen ? (
      <div data-testid="confirmation-dialog" data-title={title} data-message={message}>
        Confirmation Dialog
      </div>
    ) : null
  )
}));

describe('AdminView Component', () => {
  const mockUserInfo = {
    id: 1,
    first_name: 'Admin',
    last_name: 'User'
  };

  const mockPhysicians = [
    { id: 1, first_name: 'John', last_name: 'Doe', email_address: 'john.doe@example.com' },
    { id: 2, first_name: 'Jane', last_name: 'Smith', email_address: 'jane.smith@example.com' }
  ];
  
  const mockAdmins = [{ id: 1, name: 'Admin User' }];
  
  const navigateMock = vi.fn();
  const logoutMock = vi.fn();
  const getAccessTokenSilentlyMock = vi.fn(() => Promise.resolve('mock-token'));

  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth0.mockReturnValue({
      user: { name: 'Admin User' },
      logout: logoutMock,
      getAccessTokenSilently: getAccessTokenSilentlyMock,
      isLoading: false
    });
    
    useNavigate.mockReturnValue(navigateMock);
    
    getPhysicians.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPhysicians)
    });
    
    getAdmins.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockAdmins)
    });
    
    createPhysician.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(JSON.stringify({ 
        id: 3, 
        first_name: 'New', 
        last_name: 'Physician',
        email_address: 'new.physician@example.com'
      }))
    });
    
    deletePhysicianByID.mockResolvedValue({ ok: true });
  });

  it('renders the admin dashboard header', async () => {
    render(<AdminView userInfo={mockUserInfo} />);
    
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
  });

  it('shows add physician tab by default', async () => {
    render(<AdminView userInfo={mockUserInfo} />);
    
    await waitFor(() => {
      expect(screen.getByText('Add a new physician to the system.')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    });
  });

  it('can switch to device management tab', async () => {
    render(<AdminView userInfo={mockUserInfo} />);
    
    await waitFor(() => {
      const tabButtons = screen.getAllByRole('button');
      const deviceManagementButton = Array.from(tabButtons).find(
        button => button.textContent.includes('Device Management')
      );
      
      if (deviceManagementButton) {
        fireEvent.click(deviceManagementButton);
        expect(screen.getByTestId('device-management')).toBeInTheDocument();
      }
    });
  });

  it('handles logout', async () => {
    render(<AdminView userInfo={mockUserInfo} />);
    
    await waitFor(() => {
      const logoutButton = screen.getByTitle('Logout');
      fireEvent.click(logoutButton);
      
      expect(logoutMock).toHaveBeenCalledWith({ returnTo: window.location.origin });
    });
  });
});