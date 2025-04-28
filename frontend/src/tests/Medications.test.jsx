import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Medications from '../components/Medications';
import { useAuth0 } from '@auth0/auth0-react';
import { 
  getPatientMedications, 
  createMedication, 
  logMedicationIntake,
  deleteMedication 
} from '../apis/medicationService';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn()
}));

vi.mock('../apis/medicationService', () => ({
  getPatientMedications: vi.fn(),
  createMedication: vi.fn(),
  logMedicationIntake: vi.fn(),
  deleteMedication: vi.fn()
}));

describe('Medications Component', () => {
  const mockPatientId = 1;
  const mockShowNotification = vi.fn();
  const mockShowConfirmation = vi.fn();
  
  const mockMedications = [
    {
      id: 1,
      name: 'Ibuprofen',
      dosage: '400mg',
      instructions: 'Take twice daily',
      last_taken: '2025-04-27T10:30:00Z'
    },
    {
      id: 2,
      name: 'Amoxicillin',
      dosage: '500mg',
      instructions: 'Take three times daily with meals',
      last_taken: null
    }
  ];
  
  const getAccessTokenSilentlyMock = vi.fn(() => Promise.resolve('mock-token'));
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    useAuth0.mockReturnValue({
      getAccessTokenSilently: getAccessTokenSilentlyMock
    });
    
    getPatientMedications.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMedications)
    });
    
    createMedication.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        id: 3,
        name: 'New Medication',
        dosage: '200mg',
        instructions: 'Take as needed'
      })
    });
    
    logMedicationIntake.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        ...mockMedications[0],
        last_taken: new Date().toISOString()
      })
    });
    
    deleteMedication.mockResolvedValue({
      ok: true
    });
    
    window.confirm = vi.fn(() => true);
  });

  it('renders the medications component title', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Medications')).toBeInTheDocument();
    });
  });

  it('loads and displays patient medications', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(getPatientMedications).toHaveBeenCalledWith(mockPatientId, 'mock-token');
      expect(screen.getByText('Ibuprofen')).toBeInTheDocument();
      expect(screen.getByText('400mg · Take twice daily')).toBeInTheDocument();
      expect(screen.getByText('Amoxicillin')).toBeInTheDocument();
      expect(screen.getByText('500mg · Take three times daily with meals')).toBeInTheDocument();
    });
  });

  it('displays loading state while fetching medications', () => {
    getPatientMedications.mockReturnValueOnce(new Promise(() => {}));
    
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    expect(screen.getByText('Loading medications...')).toBeInTheDocument();
  });

  it('shows error message when fetching medications fails', async () => {
    getPatientMedications.mockRejectedValueOnce(new Error('Failed to fetch medications'));
    
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('Error loading medications'), 
        'error'
      );
    });
  });

  it('allows adding a new medication', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Add New Medication')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Medication Name'), { 
      target: { value: 'New Medication' } 
    });
    
    fireEvent.change(screen.getByLabelText('Dosage'), { 
      target: { value: '200mg' } 
    });
    
    fireEvent.change(screen.getByLabelText('Instructions'), { 
      target: { value: 'Take as needed' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Medication/i }));
    
    await waitFor(() => {
      expect(createMedication).toHaveBeenCalledWith(
        {
          patient_id: mockPatientId,
          name: 'New Medication',
          dosage: '200mg',
          instructions: 'Take as needed'
        },
        'mock-token'
      );
      
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('added successfully'), 
        'success'
      );
    });
  });

  it('validates the new medication form', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText('Medication Name')).toBeInTheDocument();
    });
    
    // Submit with empty form
    fireEvent.click(screen.getByRole('button', { name: /Add Medication/i }));
    
    expect(createMedication).not.toHaveBeenCalled();
  });

  it('allows logging medication intake', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      const logIntakeButtons = screen.getAllByRole('button', { name: /Log Intake/i });
      fireEvent.click(logIntakeButtons[0]); // Click the first medication's log button
    });
    
    await waitFor(() => {
      expect(logMedicationIntake).toHaveBeenCalledWith(mockMedications[0].id, 'mock-token');
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('intake logged successfully'), 
        'success'
      );
    });
  });

  it('allows deleting a medication with confirmation', async () => {
    // Using the showConfirmation prop
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButtons[0]); // Click the first medication's delete button
    });
    
    await waitFor(() => {
      expect(mockShowConfirmation).toHaveBeenCalledWith(
        'Delete Medication',
        expect.stringContaining('Are you sure you want to delete'),
        expect.any(Function),
        'Delete',
        'Cancel',
        'danger'
      );
      
      // Simulate confirmation action
      const confirmationFn = mockShowConfirmation.mock.calls[0][2];
      confirmationFn();
      
      expect(deleteMedication).toHaveBeenCalledWith(mockMedications[0].id, 'mock-token');
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('deleted successfully'), 
        'success'
      );
    });
  });

  it('displays empty state when no medications are available', async () => {
    getPatientMedications.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });
    
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('No medications added yet')).toBeInTheDocument();
    });
  });

  it('formats timestamp correctly', async () => {
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      // The second medication has no last_taken timestamp
      const noRecordText = screen.getByText('No record');
      expect(noRecordText).toBeInTheDocument();
    });
  });

  it('handles API errors when adding medications', async () => {
    createMedication.mockRejectedValueOnce(new Error('Failed to add medication'));
    
    render(
      <Medications 
        patientId={mockPatientId} 
        showNotification={mockShowNotification} 
        showConfirmation={mockShowConfirmation} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByLabelText('Medication Name')).toBeInTheDocument();
    });
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText('Medication Name'), { 
      target: { value: 'Error Medication' } 
    });
    
    fireEvent.change(screen.getByLabelText('Dosage'), { 
      target: { value: '100mg' } 
    });
    
    fireEvent.change(screen.getByLabelText('Instructions'), { 
      target: { value: 'Test instructions' } 
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Add Medication/i }));
    
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        expect.stringContaining('Error adding medication'), 
        'error'
      );
    });
  });
});