import { BACKEND_URL } from '@/constants.js'
import { useAuth0 } from '@auth0/auth0-react'

export async function getPatients(token){
  return fetch(`${BACKEND_URL}/patients`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}

export async function getPatientByID(id,token){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}

export async function createPatient(patientData,token){
  return fetch(`${BACKEND_URL}/patients`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    },
    body: JSON.stringify(patientData)
  })
}

export async function updatePatientByID(id, patientData, token){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    },
    body: JSON.stringify(patientData)
  })
}

export async function deletePatientByID(id, token){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}

export async function createPatientByPhysician(physicianId, patientData, token){
  
  const data = {
    ...patientData,
    physician_id: physicianId
  };
  
  return fetch(`${BACKEND_URL}/patients`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });
}

export async function deletePatientByPhysician(physicianId, patientId, token){
  return fetch(`${BACKEND_URL}/physicians/${physicianId}/patients/${patientId}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + token
    }
  });
}