import { BACKEND_URL } from '@/constants.js'

export async function getPatientMedications(patientId, token) {
  return fetch(`${BACKEND_URL}/medications/patient/${patientId}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
}

export async function getMedicationById(id, token) {
  return fetch(`${BACKEND_URL}/medications/${id}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
}

export async function createMedication(medicationData, token) {
  return fetch(`${BACKEND_URL}/medications`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(medicationData)
  })
}

export async function updateMedication(id, medicationData, token) {
  return fetch(`${BACKEND_URL}/medications/${id}`, {
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(medicationData)
  })
}

export async function logMedicationIntake(id, token) {
  return fetch(`${BACKEND_URL}/medications/${id}/log`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
}

export async function deleteMedication(id, token) {
  return fetch(`${BACKEND_URL}/medications/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  })
}