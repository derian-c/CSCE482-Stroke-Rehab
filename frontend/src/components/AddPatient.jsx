import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';

const AddPatient = ({ isOpen, onClose, onAddPatient, showNotification }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError('All fields are required');
      return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      // Try to add the patient
      await onAddPatient({
        first_name: firstName,
        last_name: lastName,
        email_address: email
      });

      // Clear form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      
      // Show success notification if available
      if (showNotification) {
        showNotification(`Patient ${firstName} ${lastName} added successfully!`, 'success');
      }
      
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add patient');
      
      // Show error notification if available
      if (showNotification) {
        showNotification(`Failed to add patient: ${err.message || 'Unknown error'}`, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <UserPlus className="h-5 w-5 mr-2 text-blue-600" />
            Add New Patient
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-4">
            <label 
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              placeholder="e.g. John"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label 
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              placeholder="e.g. Doe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label 
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              placeholder="e.g. patient@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
            
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            {isSubmitting ? 'Adding...' : 'Add Patient'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPatient;