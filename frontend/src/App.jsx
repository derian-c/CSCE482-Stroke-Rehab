import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import PatientPage from "./pages/PatientPage";
import PhysicianPage from "./pages/PhysicianPage";
import AdminPage from "./pages/AdminPage";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <a href="/">LoginPage</a>
            </li>
            <li>
              <a href="/patient">PatientPage</a>
            </li>
            <li>
              <a href="/physician">PhysicianPage</a>
            </li>
            <li>
              <a href="/admin">AdminPage</a>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route exact path="/" element={<LoginPage />} />
          <Route path="/patient" element={<PatientPage />} />
          <Route path="/physician" element={<PhysicianPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
