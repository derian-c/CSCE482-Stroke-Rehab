import { BACKEND_URL } from '@/constants.js'

export async function createDevice(data, token) {
  return fetch(`${BACKEND_URL}/physicians`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    },
    body: JSON.stringify(physicianData)
  })
}

