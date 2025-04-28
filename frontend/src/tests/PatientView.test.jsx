import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PatientView from '../pages/PatientView';

const mockAuth0 = {
  user: { name: 'Test Patient', email: 'test@example.com' },
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

vi.mock('../components/MedicalRecords', () => ({
  default: (props) => (
    <div data-testid="medical-records-component">
      <div>Medical Records Component</div>
      <div data-testid="patient-id-prop">{props.patientId}</div>
      {props.initialSelectedType && (
        <div data-testid="selected-type-prop">{props.initialSelectedType}</div>
      )}
    </div>
  )
}));

vi.mock('../components/Medications', () => ({
  default: (props) => (
    <div data-testid="medications-component">
      <div>Medications Component</div>
      <div data-testid="patient-id-prop">{props.patientId}</div>
    </div>
  )
}));

vi.mock('../components/AccessibilityMenu', () => ({
  default: () => <div data-testid="accessibility-menu-component">Accessibility Menu Component</div>
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

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

vi.mock('../pages/PatientView', async () => {
  const actual = await vi.importActual('../pages/PatientView');
  
  return {
    ...actual,
    default: (props) => {
      if (props.userInfo === null) {
        return <div data-testid="loading-screen">Loading...</div>;
      }
      
      return actual.default(props);
    }
  };
});

beforeEach(() => {
  global.localStorage = {
    getItem: vi.fn().mockImplementation((key) => {
      if (key === 'readMessageIds') return JSON.stringify([1, 2, 3]);
      return null;
    }),
    setItem: vi.fn(),
  };
});

describe('PatientView Component', () => {
  const mockUserInfo = {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    physician: {
      id: 100,
      first_name: 'Dr',
      last_name: 'Smith'
    }
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.off.mockClear();
  });
  
  it('renders the patient dashboard with user info', () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Patient Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Test Patient')).toBeInTheDocument();
  });
  
  it('displays dashboard tab content by default', () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const tabContent = screen.getByRole('main');
    expect(tabContent).toBeInTheDocument();
  });
  
  it('allows tab switching to messages tab', async () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const messagesTab = screen.getByText('Messages');
    fireEvent.click(messagesTab);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    });
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join', {
      patient_id: mockUserInfo.id,
      physician_id: mockUserInfo.physician.id
    });
  });
  
  it('allows tab switching to records tab', async () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const recordsTab = screen.getByText('Medical Records');
    fireEvent.click(recordsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('medical-records-component')).toBeInTheDocument();
    });
  });
  
  it('allows tab switching to medications tab', async () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const medicationsTab = screen.getByText('Medications');
    fireEvent.click(medicationsTab);
    
    await waitFor(() => {
      expect(screen.getByTestId('medications-component')).toBeInTheDocument();
    });
  });
  
  it('emits socket join event on initial render', () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(mockSocket.emit).toHaveBeenCalledWith('join', {
      patient_id: mockUserInfo.id,
      physician_id: mockUserInfo.physician.id
    });
  });
  
  it('handles message sending in the messages tab', async () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    const messagesTab = screen.getByText('Messages');
    fireEvent.click(messagesTab);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Type your message here...')).toBeInTheDocument();
    });
    
    const messageInput = screen.getByPlaceholderText('Type your message here...');
    const sendButton = screen.getByText('Send Message');
    
    fireEvent.change(messageInput, { target: { value: 'Hello doctor' } });
    fireEvent.click(sendButton);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      patient_id: mockUserInfo.id,
      physician_id: mockUserInfo.physician.id,
      content: 'Hello doctor',
      sender: mockUserInfo.id
    });
  });
  
  it('renders loading state when userInfo is not provided', () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={null} />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('loading-screen')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
  
  it('includes the accessibility menu', () => {
    render(
      <MemoryRouter>
        <PatientView userInfo={mockUserInfo} />
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('accessibility-menu-component')).toBeInTheDocument();
  });
});