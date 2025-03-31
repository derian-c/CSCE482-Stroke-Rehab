// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PatientView from './pages/PatientView'
import AdminView from './pages/AdminView'
import PhysicianView from './pages/PhysicianView'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderView from './pages/ProviderView'
import MedicalHistoryPage from './pages/MedicalHistoryPage'
import ExerciseRecordsPage from './pages/ExerciseRecordsPage'
import LabResultsPage from './pages/LabResultsPage'

// Import accessibility styles
import './styles/AccessibilityStyles.css'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* The profile route is protected */}
        <Route 
          path="/admin"
          element={
            <ProtectedRoute allowedRole='Admin'>
              <AdminView />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/patient"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <PatientView />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/physician"
          element={
            <ProtectedRoute allowedRole='Physician'>
              <PhysicianView />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/provider"
          element={
            <ProtectedRoute  allowedRole='Admin'>
              <ProviderView />
            </ProtectedRoute>
          }
        />
        
        {/* New Medical Record Routes */}
        <Route 
          path="/medical-history"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <MedicalHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/exercise-records"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <ExerciseRecordsPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/lab-results"
          element={
            <ProtectedRoute allowedRole='Patient'>
              <LabResultsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App