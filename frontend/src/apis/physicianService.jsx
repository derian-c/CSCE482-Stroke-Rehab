import { BACKEND_URL } from '@/constants.js'

export async function getPhysicians(){
  return fetch(`${BACKEND_URL}/physicians`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export async function getPhysicianByID(id){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}

export async function createPhysician(physicianData){
  return fetch(`${BACKEND_URL}/physicians`,{
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(physicianData)
  })
}

export async function updatePhysicianByID(id, physicianData){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'PUT',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(physicianData)
  })
}

export async function deletePhysicianByID(id){
  return fetch(`${BACKEND_URL}/physicians/${id}`,{
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
    //got rid of body
  })
}
