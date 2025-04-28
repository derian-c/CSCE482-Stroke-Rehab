import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddPatient from '../components/AddPatient';

describe('AddPatient Component', () => {
  const mockOnClose = vi.fn();
  const mockOnAddPatient = vi.fn();
  const mockShowNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnAddPatient.mockResolvedValue({ id: 1, first_name: 'John', last_name: 'Doe' });
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <AddPatient 
        isOpen={false} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders the form when isOpen is true', () => {
    render(
      <AddPatient 
        isOpen={true} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    expect(screen.getByText('Add New Patient')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
  });

  it('allows closing the modal', () => {
    render(
      <AddPatient 
        isOpen={true} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('submits the form with valid data', async () => {
    render(
      <AddPatient 
        isOpen={true} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john.doe@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Add Patient/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnAddPatient).toHaveBeenCalledWith({
        first_name: 'John',
        last_name: 'Doe',
        email_address: 'john.doe@example.com'
      });
      
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockShowNotification).toHaveBeenCalledWith(
        'Patient John Doe added successfully!',
        'success'
      );
    });
  });

  it('handles API errors', async () => {
    const errorMessage = 'Patient email already exists';
    mockOnAddPatient.mockRejectedValueOnce(new Error(errorMessage));
    
    render(
      <AddPatient 
        isOpen={true} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john.doe@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Add Patient/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(mockShowNotification).toHaveBeenCalledWith(
        `Failed to add patient: ${errorMessage}`,
        'error'
      );
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  it('shows loading state while submitting', async () => {
    mockOnAddPatient.mockImplementationOnce(() => {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({ id: 1, first_name: 'John', last_name: 'Doe' });
        }, 100);
      });
    });
    
    render(
      <AddPatient 
        isOpen={true} 
        onClose={mockOnClose} 
        onAddPatient={mockOnAddPatient}
        showNotification={mockShowNotification}
      />
    );
    
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email Address'), { target: { value: 'john.doe@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /Add Patient/i });
    fireEvent.click(submitButton);
    
    expect(screen.getByText('Adding...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(mockOnAddPatient).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});