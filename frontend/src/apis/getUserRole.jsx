export async function getUsersRole(user, getAccessTokenSilently) {
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await getAccessTokenSilently();

  const response = await fetch(
    `${import.meta.env.VITE_AUTH0_ISSUER_BASE_URL}/api/v2/users/${
      user.sub
    }/roles`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to fetch role");
  }
  const data = await response.json();

  console.log("Raw response text:", text);

  return data;
}
