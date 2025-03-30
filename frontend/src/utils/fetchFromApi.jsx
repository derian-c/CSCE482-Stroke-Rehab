import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

const AUDIENCE = import.meta.env.VITE_API_AUDIENCE
const BASE_URL = import.meta.env.VITE_BACKEND_URL

const useFetchProtectedData = (apiEndpoint) => {
  const { getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(`${BASE_URL}${apiEndpoint}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch protected data");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAccessTokenSilently, isAuthenticated, apiEndpoint]);
  return { data, error, loading };
};

export default useFetchProtectedData;

