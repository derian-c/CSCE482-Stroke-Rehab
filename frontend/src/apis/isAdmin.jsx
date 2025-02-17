export async function isAdmin(roles) {
  try {
    if (!Array.isArray(roles)) {
      console.error("Roles are not in an array format:", roles);
      return false;
    }
    console.log("help");
    console.log(roles);
    return roles.some((role) => role.name.toLowerCase() === "admin");
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}
