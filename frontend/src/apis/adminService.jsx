import { BACKEND_URL } from '@/constants.js'

export async function getAdmins(token){
  return fetch(`${BACKEND_URL}/admins`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}