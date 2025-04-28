import { BACKEND_URL } from '../constants.js'

export async function getSasToken(container_name,token){
  return fetch(`${BACKEND_URL}/sas_token/${container_name}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}