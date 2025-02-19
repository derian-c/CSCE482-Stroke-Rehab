import React from "react";
import { isAdmin } from "../apis/isAdmin";
import { getUsersRole } from "../apis/getUserRole";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import useFetchProtectedData from "../utils/fetchFromApi";

function AdminView() {
  const { user, isAuthenticated, getAccessTokenSilently, isLoading } =
    useAuth0();
  const [canEnter, setCanEnter] = useState(false);
  const navigate = useNavigate();
  const {data, err, loading} = useFetchProtectedData('/api/private');
  const [msg, setmsg] = useState("loading")

  useEffect(() => {
    const checkAccess = async () => {
      try {
        if (isLoading) {
          return (
            <div>
              <h1>Stuck Loading!</h1>
            </div>
          );
        }
        const roles = await getUsersRole(user, getAccessTokenSilently);
        const permission = await isAdmin(roles);
        if (permission) {
          setCanEnter(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking permissions", error);
        setCanEnter(false);
      }
    };

    checkAccess();
  }, []);

  useEffect(() => {
    const getMessage = async () => {
      try {
        if(loading) {
          return (
            <div>
              <h1>loading</h1>
            </div>
          )
        }
        const message = data.message;
        setmsg(message);
      }
      catch (error) {
        console.error("Error getting message", error);
      }
    }
    getMessage()
  }, [data, loading]);

  return (
    <div>
      <h1>Welcome to the Admin Page {user.name}!</h1>
      <p>{msg}</p>
    </div>
  );
}

export default AdminView;
