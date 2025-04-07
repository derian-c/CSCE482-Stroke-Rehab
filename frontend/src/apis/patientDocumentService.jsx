// API service for patient documents
import { BACKEND_URL } from '@/constants.js'

// Get all documents for a patient
export const getPatientDocuments = async (patientId, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Get documents by type (medical_history, exercise_record, lab_result)
export const getPatientDocumentsByType = async (patientId, documentType, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/patient/${patientId}/type/${documentType}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Get documents after a specific date
export const getPatientDocumentsAfterDate = async (patientId, date, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/patient/${patientId}/after/${date}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Get a specific document by ID
export const getPatientDocumentById = async (documentId, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/${documentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Create a new document
export const createPatientDocument = async (documentData, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/create`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(documentData)
  });
  return response;
};

// Update a document
export const updatePatientDocument = async (documentId, documentData, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/${documentId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(documentData)
  });
  return response;
};

// Delete a document
export const deletePatientDocument = async (documentId, token) => {
  const response = await fetch(`${BACKEND_URL}/patient_documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};