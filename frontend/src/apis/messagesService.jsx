import { BACKEND_URL } from '@/constants.js'

export async function getMessages(data){
  return fetch(`${BACKEND_URL}/chat_messages/${data.patient_id}/${data.physician_id}`,{
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  })
}