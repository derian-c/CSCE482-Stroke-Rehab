export function isAdmin(roles) {
  try {
    if (!Array.isArray(roles)) {
      console.error("Roles are not in an array format:", roles);
      return false;
    }
    return roles.some((role) => role.toLowerCase() === "admin");
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}
