import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import PatientView from './PatientView.jsx';
import PhysicianView from './PhysicianView.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/patient" element={<PatientView />} />
        <Route path="/physician" element={<PhysicianView />} />
      </Routes>
    </Router>
  </StrictMode>,
);
