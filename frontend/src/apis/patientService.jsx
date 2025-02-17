async function getPatients(){
  const response = await fetch('/api/patients')
  if(!response.ok){
    return {}
  }
  return response.json()
}

export {getPatients}
