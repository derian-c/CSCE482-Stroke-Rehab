import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { getPatients, createPatientByPhysician, deletePatientByID } from '../apis/patientService';
import { getMotionFiles } from '../apis/motionFileService';
import { getMessages } from '../apis/messagesService';
import { getSasToken } from '../apis/sasTokenService';
import PhysicianView from '../pages/PhysicianView';

vi.mock('../apis/patientService', () => ({
  getPatients: vi.fn(),
  createPatientByPhysician: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      id: 999,
      first_name: 'New',
      last_name: 'Patient',
      email_address: 'new@example.com'
    })
  }),
  deletePatientByID: vi.fn().mockResolvedValue({ ok: true })
}));

vi.mock('../apis/motionFileService', () => ({
  getMotionFiles: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([])
  })
}));

vi.mock('../apis/messagesService', () => ({
  getMessages: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([])
  })
}));

vi.mock('../apis/sasTokenService', () => ({
  getSasToken: vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ token: 'mock-token' })
  })
}));

const mockAuth0 = {
  user: { name: 'Dr. Test Doctor', email: 'doctor@example.com' },
  getAccessTokenSilently: vi.fn().mockResolvedValue('mock-token'),
  logout: vi.fn()
};

const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn()
};

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => mockAuth0
}));

vi.mock('../components/SocketProvider', () => ({
  useSocket: () => mockSocket
}));

vi.mock('../components/AccessibilityMenu', () => ({
  default: () => <div data-testid="accessibility-menu-component">Accessibility Menu Component</div>
}));

vi.mock('../components/AddPatient', () => ({
  default: (props) => (
    <div data-testid="add-patient-component">
      <button data-testid="close-add-patient" onClick={props.onClose}>Close</button>
      <button data-testid="submit-add-patient" onClick={() => props.onAddPatient({
        first_name: 'New',
        last_name: 'Patient',
        email_address: 'new@example.com'
      })}>Add Patient</button>
    </div>
  )
}));

vi.mock('../components/NotificationToast', () => ({
  default: (props) => (
    <div data-testid="notification-toast-component">
      <div>Message: {props.message}</div>
      <div>Type: {props.type}</div>
    </div>
  )
}));

vi.mock('../components/ConfirmationDialog', () => ({
  default: (props) => (
    <div data-testid="confirmation-dialog-component">
      <div>Title: {props.title}</div>
      <div>Message: {props.message}</div>
      <button data-testid="confirm-button" onClick={props.onConfirm}>
        {props.confirmText || 'Confirm'}
      </button>
      <button data-testid="cancel-button" onClick={props.onClose}>
        {props.cancelText || 'Cancel'}
      </button>
    </div>
  )
}));

vi.mock('../components/MotionReadingsTab', () => ({
  default: () => <div data-testid="motion-readings-component">Motion Readings Component</div>
}));

vi.mock('../components/MotionFilesTab', () => ({
  default: () => <div data-testid="motion-files-component">Motion Files Component</div>
}));

vi.mock('../graphics/render', () => ({
  default: () => <div data-testid="patient-model-component">Patient Model Component</div>
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('PhysicianView Component', () => {
  const mockUserInfo = {
    id: 123,
    first_name: 'Test',
    last_name: 'Doctor',
    patients: [
      {
        id: 1,
        first_name: 'John',
        last_name: 'Doe',
        messages: [],
        motionFiles: [{
          id: 101,
          name: 'test_motion.osim',
          url: 'https://example.com/test.osim',
          createdAt: '2023-01-01'
        }]
      }
    ]
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
    
    global.localStorage = {
      getItem: vi.fn().mockImplementation((key) => {
        if (key === 'physicianReadMessageIds') return JSON.stringify([1, 2, 3]);
        return null;
      }),
      setItem: vi.fn(),
    };

    window.innerWidth = 1024;
    window.innerHeight = 768;
  });
  
  it('renders the physician dashboard with user info', () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Physician Dashboard')).toBeInTheDocument();
    expect(screen.getByText(`Dr. ${mockUserInfo.first_name} ${mockUserInfo.last_name}`)).toBeInTheDocument();
  });
  
  it('shows empty state when no patient is selected', () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Select a patient to view details')).toBeInTheDocument();
  });
  
  
  it('contains an add patient button and shows dialog on click', async () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const addButton = screen.getByText('Add New Patient');
    expect(addButton).toBeInTheDocument();
    
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('add-patient-component')).toBeInTheDocument();
    });
  });
  
  it('handles adding a new patient', async () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const addButton = screen.getByText('Add New Patient');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('add-patient-component')).toBeInTheDocument();
    });
    
    const submitButton = screen.getByTestId('submit-add-patient');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(createPatientByPhysician).toHaveBeenCalled();
      expect(screen.getByTestId('notification-toast-component')).toBeInTheDocument();
    });
  });
  
  
  it('allows physician to logout', () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const logoutButton = screen.getByTitle('Logout') || screen.getByLabelText('Logout');
    expect(logoutButton).toBeInTheDocument();
    
    fireEvent.click(logoutButton);
    
    expect(mockAuth0.logout).toHaveBeenCalled();
  });
  
  
  it('includes the accessibility menu', () => {
    render(
      <MemoryRouter>
        <PhysicianView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('accessibility-menu-component')).toBeInTheDocument();
  });
});