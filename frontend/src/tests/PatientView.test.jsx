// src/tests/PatientView.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import PatientView from '../pages/PatientView';
import { useAuth0 } from '@auth0/auth0-react';
import { useSocket } from '@/components/SocketProvider';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: vi.fn()
}));

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

vi.mock('@/components/SocketProvider', () => ({
  useSocket: vi.fn()
}));

// Mock child components
vi.mock('@/components/MedicalRecords', () => ({
  default: () => <div data-testid="medical-records">Medical Records Component</div>
}));

vi.mock('@/components/Medications', () => ({
  default: () => <div data-testid="medications">Medications Component</div>
}));

describe('PatientView Component', () => {
  // Setup mock data
  const mockUserInfo = {
    id: 1,
    first_name: 'Jane',
    last_name: 'Smith',
    physician: { id: 1, first_name: 'John', last_name: 'Doe' }
  };

  const mockSocket = {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn()
  };

  const navigateMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup auth0 mock
    useAuth0.mockReturnValue({
      user: { name: 'Jane Smith' },
      logout: vi.fn(),
      getAccessTokenSilently: vi.fn(() => Promise.resolve('mock-token'))
    });
    
    // Setup socket mock
    useSocket.mockReturnValue(mockSocket);
    
    // Setup navigate mock
    useNavigate.mockReturnValue(navigateMock);
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('[]');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  it('renders the patient dashboard header', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    expect(screen.getByText('Patient Dashboard')).toBeInTheDocument();
  });

  it('shows dashboard tab by default', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    expect(screen.getByText('Exercise Progress')).toBeInTheDocument();
    expect(screen.getByText('Treatment Milestones')).toBeInTheDocument();
  });

  it('can switch to messages tab', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    
    // Click on Messages tab
    fireEvent.click(screen.getByText('Messages'));
    
    // Check that messages view is displayed
    expect(screen.getByText('Messages with Your Care Team')).toBeInTheDocument();
  });

  it('can switch to records tab', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    
    // Click on Medical Records tab
    fireEvent.click(screen.getByText('Medical Records'));
    
    // Check that records view is displayed
    expect(screen.getByText('Medical Records')).toBeInTheDocument();
    expect(screen.getByTestId('medical-records')).toBeInTheDocument();
  });

  it('can switch to medications tab', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    
    // Click on Medications tab
    fireEvent.click(screen.getByText('Medications'));
    
    // Check that medications view is displayed
    expect(screen.getByTestId('medications')).toBeInTheDocument();
  });

  it('can navigate to specific document pages', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    
    // Find and click Medical History quick access button
    fireEvent.click(screen.getByText('Medical History'));
    
    // Check that we switched to records tab with medical history selected
    expect(screen.getByText('Medical Records')).toBeInTheDocument();
  });

  it('handles logout', () => {
    render(<PatientView userInfo={mockUserInfo} />);
    
    // Click logout button
    fireEvent.click(screen.getByTitle('Logout'));
    
    // Check that logout was called
    expect(useAuth0().logout).toHaveBeenCalled();
  });

});