import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { HeartPulse, Lock, Unlock } from "lucide-react";

const Home = () => {
  const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

  return (
    <div className="fixed inset-0 w-full h-full bg-gray-50 flex flex-col">
      <div className="flex-1 w-full h-full p-4 flex items-center justify-center">
        <div className="w-full max-w-md sm:max-w-lg md:max-w-xl bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-blue-600 p-6 text-white">
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-3">
                <HeartPulse size={48} color="#3B82F6" strokeWidth={1.5} className="animate-pulse" />
              </div>
              <h2 className="text-2xl font-bold tracking-wide text-blue-600 drop-shadow-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                Houston Methodist <span className="text-blue-800">+</span> <span className="text-blue-500">LIVE Lab</span>
              </h2>
            </div>

            <div className="space-y-4">
              {!isAuthenticated ? (
                <button
                  onClick={() => loginWithRedirect()}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Unlock size={20} />
                  <span>Login</span>
                </button>
              ) : (
                <button
                  onClick={() =>
                    logout({ logoutParams: { returnTo: window.location.origin } })
                  }
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Lock size={20} />
                  <span>Logout</span>
                </button>
              )}
            </div>

            <div className="pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-2 text-center">New patient?</p>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-blue-500">📧</span>
                  <p>
                    Send an email to{" "}
                    <span className="font-medium text-blue-600">
                      your physician!
                    </span>
                  </p>
                </div>
                <p className="mt-4 text-xs text-gray-500 text-center">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;