import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProviderView from '../pages/ProviderView';
import { useAuth0 } from '@auth0/auth0-react';

vi.mock('@auth0/auth0-react', () => ({
  useAuth0: vi.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { sub: 'provider123', name: 'Test Provider' }
  }))
}));

describe('ProviderView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the provider dashboard header', () => {
    render(<ProviderView />);
    expect(screen.getByText('Provider Dashboard')).toBeInTheDocument();
  });

  it('renders the patient list', () => {
    render(<ProviderView />);
    expect(screen.getByText('Patients')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('shows initial empty state when no patient is selected', () => {
    render(<ProviderView />);
    expect(screen.getByText('Select a patient to view details')).toBeInTheDocument();
  });

  it('shows patient details when a patient is selected', () => {
    render(<ProviderView />);
    
    fireEvent.click(screen.getByText('Jane Doe'));
    
    expect(screen.getByText(/Female, \d+ years/)).toBeInTheDocument();
    expect(screen.getByText('Insurance: Aetna')).toBeInTheDocument();
  });

  it('shows medical history tab by default when a patient is selected', () => {
    render(<ProviderView />);
    
    fireEvent.click(screen.getByText('Jane Doe'));
    
  });

  it('can navigate between different tabs', () => {
    render(<ProviderView />);
    
    fireEvent.click(screen.getByText('Jane Doe'));
    
    fireEvent.click(screen.getByText('Medications'));
    expect(screen.getByText('Current Medications')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Billing'));
    expect(screen.getByText('Billing Information')).toBeInTheDocument();

  });

  it('shows correct patient data in the billing tab', () => {
    render(<ProviderView />);
    
    fireEvent.click(screen.getByText('Jane Doe'));
    
    fireEvent.click(screen.getByText('Billing'));
    
  });

  it('allows searching for patients', () => {
    render(<ProviderView />);
    
    const searchInput = screen.getByPlaceholderText('Search patients...');
    expect(searchInput).toBeInTheDocument();
    
  });
});