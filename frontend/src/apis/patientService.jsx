import { BACKEND_URL } from '@/constants.js'

export async function getPatients(){
  return fetch(`${BACKEND_URL}/patients`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export async function getPatientByID(id){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export async function createPatient(patientData){
  return fetch(`${BACKEND_URL}/patients`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  })
}

export async function updatePatientByID(id, patientData){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(patientData)
  })
}

export async function deletePatientByID(id){
  return fetch(`${BACKEND_URL}/patients/${id}`,{
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  })
}
