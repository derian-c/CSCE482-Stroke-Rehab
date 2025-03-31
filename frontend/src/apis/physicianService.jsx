import { BACKEND_URL } from '@/constants.js'
import { useAuth0 } from '@auth0/auth0-react'

export async function getPhysicians(token){
  return fetch(`${BACKEND_URL}/physicians`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}

export async function getPhysicianByID(id, token){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}

export async function createPhysician(physicianData, token){
  return fetch(`${BACKEND_URL}/physicians`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    },
    body: JSON.stringify(physicianData)
  })
}

export async function updatePhysicianByID(id, physicianData, token){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+token
    },
    body: JSON.stringify(physicianData)
  })
}

export async function deletePhysicianByID(id, token){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
    //got rid of body
  })
}
