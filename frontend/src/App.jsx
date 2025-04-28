// src/App.jsx
import React, { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Home from './pages/Home'
import PatientView from './pages/PatientView'
import AdminView from './pages/AdminView'
import PhysicianView from './pages/PhysicianView'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderView from './pages/ProviderView'
import MedicalHistoryPage from './pages/MedicalHistoryPage'
import ExerciseRecordsPage from './pages/ExerciseRecordsPage'
import LabResultsPage from './pages/LabResultsPage'
import LoadingScreen from './components/LoadingScreen'
import { useSocket } from './components/SocketProvider'
import { getUsersRole } from './apis/getUserRole'
import { getRouteByRole } from './utils/roleNavigation'

// Import accessibility styles
import './styles/AccessibilityStyles.css'

function App() {
  const socket = useSocket()
  const [ userInfo, setUserInfo ] = useState(null)
  const [ homeMessage, setHomeMessage ] = useState('')
  useEffect(() => {
    if(!socket) return
    function onUserInfo(data){
      setUserInfo(data)
    }
    function onWait(data){
      setHomeMessage(data.message)
    }
    function onRelogin(data){
      setHomeMessage(data.message)
    }
    socket.on('user_info',onUserInfo)
    socket.on('relogin',onRelogin)
    socket.on('wait', onWait)
    return () => {
      socket.off('user_info',onUserInfo)
      socket.off('relogin',onRelogin)
      socket.off('wait', onWait)
    }
  }, [socket])
  
  const { isAuthenticated, user, getAccessTokenSilently, isLoading } = useAuth0()
  const navigate = useNavigate()
  const [initialRedirectAttempted, setInitialRedirectAttempted] = useState(false)

  useEffect(() => {
    // Only attempt to redirect if user is authenticated and loading is complete
    if (isAuthenticated && user && !isLoading && !initialRedirectAttempted) {
      const redirectUser = async () => {
        try {
          const token = await getAccessTokenSilently()
          const userRoles = getUsersRole(user, token)
          const targetRoute = getRouteByRole(userRoles)
          
          // Only navigate if we're on the home page
          if (window.location.pathname === '/') {
            navigate(targetRoute)
          }
          
          setInitialRedirectAttempted(true)
        } catch (error) {
          console.error('Failed to redirect user based on role:', error)
          setInitialRedirectAttempted(true)
        }
      }

      redirectUser()
    }
  }, [isAuthenticated, user, isLoading, initialRedirectAttempted, navigate, getAccessTokenSilently])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home homeMessage={homeMessage} />} />
        {/* The profile route is protected */}
        <Route 
          path="/admin"
          element={
            <ProtectedRoute allowedRole='Admin'>
              <AdminView userInfo={userInfo}/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/patient"
          element={
            <ProtectedRoute allowedRole='Patient'>
              {userInfo ? 
              <PatientView userInfo={userInfo}/> :
              <LoadingScreen/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/physician"
          element={
            <ProtectedRoute allowedRole='Physician'>
              {userInfo ? 
              <PhysicianView userInfo={userInfo}/> :
              <LoadingScreen/>}
            </ProtectedRoute>
          }
        />
        <Route 
          path="/provider"
          element={
            <ProtectedRoute allowedRole='Admin'>
              <ProviderView />
            </ProtectedRoute>
          }
        />
        
        {/* New Medical Record Routes */}
        <Route 
          path="/medical-history"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <MedicalHistoryPage userInfo={userInfo}/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/exercise-records"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <ExerciseRecordsPage userInfo={userInfo}/>
            </ProtectedRoute>
          }
        />
        <Route 
          path="/lab-results"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <LabResultsPage userInfo={userInfo}/>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App