import { BACKEND_URL } from '@/constants.js'

export async function getAdmins(){
  return fetch(`${BACKEND_URL}/admins`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  })
}