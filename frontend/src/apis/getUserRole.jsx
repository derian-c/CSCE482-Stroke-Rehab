import { jwtDecode } from "jwt-decode";
export function getUsersRole(user, token) {
  if (!user) {
    throw new Error("User not authenticated");
  }

  let userRoles = [];

  try {
    const decoded = jwtDecode(token);

    // Access your custom roles claim (with your namespace!)
    userRoles = decoded["https://yourapp.com/roles"] || [];
  } catch (error) {
    console.error("Failed to decode token:", error);
  }
  return userRoles;
  // const token = await getAccessTokenSilently();

  // const response = await fetch(
  //   `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}users/${user.sub}/roles`,
  //   {
  //     method: "GET",
  //     headers: {
  //       Accept: "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   }
  // );
  // if (!response.ok) {
  //   throw new Error("Failed to fetch role");
  // }
  // const data = await response.json();

  // console.log("Raw response text:", text);
}
