import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import PatientView from "./pages/PatientView.jsx";
import PhysicianView from "./pages/PhysicianView.jsx";
import { Auth0Provider } from "@auth0/auth0-react";
import AdminView from "./pages/AdminView.jsx";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

createRoot(document.getElementById("root")).render(
  <Auth0Provider
    domain={domain}
    clientId={clientId}
    authorizationParams={{
      redirect_uri: window.location.origin,
    }}
    useRefreshTokens={true}
    cacheLocation="localstorage"
  >
    <StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/patient" element={<PatientView />} />
          <Route path="/physician" element={<PhysicianView />} />
          <Route path="/admin" element={<AdminView />} />
        </Routes>
      </Router>
    </StrictMode>
    ,
  </Auth0Provider>
);
