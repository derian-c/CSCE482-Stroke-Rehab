import { BACKEND_URL } from '../constants.js'
import { useAuth0 } from '@auth0/auth0-react'

export async function getMessages(data,token){
  return fetch(`${BACKEND_URL}/chat_messages/${data.patient_id}/${data.physician_id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer '+token
    }
  })
}