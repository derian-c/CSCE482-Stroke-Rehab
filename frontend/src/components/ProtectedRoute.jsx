// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Navigate } from 'react-router-dom'
import { getUsersRole } from '@/apis/getUserRole'

function ProtectedRoute({ children, allowedRole }) {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } = useAuth0()
  const [ userRoles, setUserRoles ] = useState([])
  const [ isLoadingRoles, setIsLoadingRoles ] = useState(true)
  useEffect(() => {
    async function getTokenAndRoles(){
      if(isLoading) return
      try{
        const token = await getAccessTokenSilently()
        setUserRoles(getUsersRole(user, token))
      }catch(error){
        console.error('Error getting access token: ',error)
      }
      setIsLoadingRoles(false)
    }
    getTokenAndRoles()
  }, [isLoading, user])

  if (isLoading || isLoadingRoles) {
    return <div>Loading...</div>
  }

  if (!user || !isAuthenticated || !userRoles.includes(allowedRole)) {
    return <Navigate to="/" />
  }

  return children
}

export default ProtectedRoute


