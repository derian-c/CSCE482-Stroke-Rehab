import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const App = () => {
  const [data, setData] = useState(null);
  const { loginWithRedirect, logout, user, isAuthenticated, isLoading } =
    useAuth0();

  useEffect(() => {
    fetch("/api/data")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => setData(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-gradient-to-r from-purple-50 to-blue-50 flex items-center justify-center">
      <div className="w-full h-full p-4 flex items-center justify-center">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white/90 backdrop-blur-sm rounded-lg shadow-xl p-6 sm:p-8 relative">
          <div className="absolute -top-6 -left-6 text-3xl animate-pulse">
            🏃‍♂️
          </div>
          <div className="absolute -top-6 -right-6 text-3xl animate-pulse">
            💪
          </div>

          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Stroke Rehabilitation Program
            </h1>
          </div>

          <div className="space-y-4">
            {data ? (
              <p className="text-gray-700">{data.message}</p>
            ) : (
              <p className="text-gray-500">Loading data...</p>
            )}

            {!isAuthenticated ? (
              <button
                onClick={() => loginWithRedirect()}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xl">🔒</span>
                <span>Login</span>
              </button>
            ) : (
              <button
                onClick={() => logout({ returnTo: window.location.origin })}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span className="text-xl">🔒</span>
                <span>Logout</span>
              </button>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 text-center">
              <p className="font-medium mb-2">New patient?</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-purple-500">📧</span>
                <p>
                  Send an email to{" "}
                  <span className="font-medium text-blue-600">
                    your physician!
                  </span>
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                By signing up, you agree to our Terms of Service and Privacy
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
