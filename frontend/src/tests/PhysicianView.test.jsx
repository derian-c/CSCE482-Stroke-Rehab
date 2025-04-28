import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PhysicianView from '../pages/PhysicianView';
import { useAuth0 } from '@auth0/auth0-react';
import { useSocket } from '@/components/SocketProvider';

// Mock dependencies
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

vi.mock('@/components/SocketProvider', () => ({
  useSocket: vi.fn()
}));

// Mock any other imported components or services
vi.mock('@/graphics/render', () => ({
  default: () => <div data-testid="patient-model">Patient 3D Model</div>
}));

vi.mock('@/components/MotionReadingsTab', () => ({
  default: () => <div data-testid="motion-readings">Motion Readings Tab</div>
}));

vi.mock('@/components/MotionFilesTab', () => ({
  default: () => <div data-testid="motion-files">Motion Files Tab</div>
}));

vi.mock('@/apis/getSasToken', () => ({
  getSasToken: vi.fn(() => Promise.resolve({ json: () => Promise.resolve({ token: 'mock-token' }) }))
}));

describe('PhysicianView Component', () => {
  // Setup mock data
  const mockUserInfo = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    patients: [
      { 
        id: 1, 
        first_name: 'Jane', 
        last_name: 'Smith',
        messages: []
      }
    ]
  };

  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup auth0 mock
    useAuth0.mockReturnValue({
      user: { name: 'Dr. John Doe' },
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
    });
    
    // Setup socket mock
    useSocket.mockReturnValue(mockSocket);
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('[]');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('renders the physician dashboard header', () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    expect(screen.getByText('Physician Dashboard')).toBeInTheDocument();
  });

  it('displays patient list', () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument();
  });

  it('shows empty state when no patient is selected', () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    expect(screen.getByText('Select a patient to view details')).toBeInTheDocument();
  });

  it('shows patient details when a patient is selected', async () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    
    // Click on patient in sidebar
    fireEvent.click(screen.getByText(/Jane Smith/));
    
    // Check that patient view is displayed
    expect(screen.getByText('Patient Model')).toBeInTheDocument();
  });

  it('can switch between tabs', async () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    
    // Select a patient first
    fireEvent.click(screen.getByText(/Jane Smith/));
    
    // Switch to Messages tab
    fireEvent.click(screen.getByText('Messages'));
    expect(screen.getByText('Message History')).toBeInTheDocument();
    
    // Switch back to Model tab
    fireEvent.click(screen.getByText('Patient Model'));
    expect(screen.getByText('Joint Analysis')).toBeInTheDocument();
  });

  it('can open the add patient modal', () => {
    render(<PhysicianView userInfo={mockUserInfo} />);
    
    // Click on Add Patient button
    fireEvent.click(screen.getByTitle('Add New Patient'));
    
    // Check if modal is displayed
    expect(screen.getByText('Add New Patient')).toBeInTheDocument();
  });

});