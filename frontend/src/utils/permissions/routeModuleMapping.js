// Route to Module Mapping
// Maps URL routes to their corresponding module keys for permission checking

export const routeModuleMapping = {
  '/dashboard': {
    moduleKey: 'dashboard',
    permissionType: 'view',
    required: false // Dashboard might be accessible to all authenticated users
  },
  '/attendance': {
    moduleKey: 'pv_attendance',
    permissionType: 'view',
    required: true
  },
  '/attendance/holidays': {
    moduleKey: 'pv_attendance',
    permissionType: 'view',
    required: true
  },
  '/modules': {
    moduleKey: 'modules',
    permissionType: 'view',
    required: true
  },
  '/module-registration': {
    moduleKey: 'modules',
    permissionType: 'add',
    required: true
  }
};

/**
 * Get module configuration for a given route
 * @param {string} pathname - The route pathname
 * @returns {Object|null} Module configuration or null if route doesn't require permissions
 */
export const getModuleForRoute = (pathname) => {
  // Check exact match first
  if (routeModuleMapping[pathname]) {
    return routeModuleMapping[pathname];
  }
  
  // Check partial matches (for nested routes)
  for (const route in routeModuleMapping) {
    if (pathname.startsWith(route)) {
      return routeModuleMapping[route];
    }
  }
  
  // No mapping found - return null (route doesn't require module permission)
  return null;
};

