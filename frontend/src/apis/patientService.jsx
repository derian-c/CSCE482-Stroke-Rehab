import { BACKEND_URL } from '../constants.js'
async function getPatients(){
  const response = await fetch(`${BACKEND_URL}/patients/`,{
    headers: {
      'Accept': 'application/json'
    }
  })

  if(!response.ok){
    return {}
  }
  return response.json()
}

export {getPatients}
