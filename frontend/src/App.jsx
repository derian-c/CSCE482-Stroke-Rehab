// src/App.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PatientView from './pages/PatientView'
import AdminView from './pages/AdminView'
import PhysicianView from './pages/PhysicianView'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderView from './pages/ProviderView'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* The profile route is protected :) */}
      <Route 
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/patient"
        element={
          <ProtectedRoute>
            <PatientView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/physician"
        element={
          <ProtectedRoute>
            <PhysicianView />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/provider"
        element={
          <ProtectedRoute>
            <ProviderView />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App


