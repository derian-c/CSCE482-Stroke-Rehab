/**
 * Determines the appropriate route based on user roles
 * Prioritizes Admin role if present, then other roles in order of hierarchy
 * @param {Array} userRoles - Array of user roles
 * @returns {string} The appropriate route path for the user
 */
export function getRouteByRole(userRoles) {
	if (!userRoles || userRoles.length === 0) {
	  return '/'; 
	}
	
	// priority order of roles, will be removed when we app is done and each user only has one role
	if (userRoles.includes('Admin')) {
	  return '/admin';
	} else if (userRoles.includes('Physician')) {
	  return '/physician';
	} else if (userRoles.includes('Patient')) {
	  return '/patient';
	} else {
	  // other role
	  console.log(`Unknown role detected: ${userRoles[0]}`);
	  return '/'; 
	}
  }