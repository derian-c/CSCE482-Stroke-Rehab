// API service for motion files
import { BACKEND_URL } from '../constants.js'

export const getMotionFiles = async (patientId, token) => {
  console.log(`${BACKEND_URL}/motion_files/patient/${patientId}`)
  const response = await fetch(`${BACKEND_URL}/motion_files/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Get motion files after a specific date
export const getMotionFilesAfterDate = async (patientId, date, token) => {
  const response = await fetch(`${BACKEND_URL}/motion_files/patient/${patientId}/after/${date}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};

// Get a specific motion file by ID
export const getMotionFileById = async (fileId, token) => {
  const response = await fetch(`${BACKEND_URL}/motion_files/${fileId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response;
};
