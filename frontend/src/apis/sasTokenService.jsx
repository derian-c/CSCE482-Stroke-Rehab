import { BACKEND_URL } from '@/constants.js'

export async function getSasToken(token){
  return fetch(`${BACKEND_URL}/sas_token`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}