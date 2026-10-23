const authorize = (...allowedRoles) => {
  return (req, resp, next) => {
    if (!req.user?.id) {
      return resp.status(401).json({
        message: "Unauthorized access, please login first",
      });
    }

    // Ensure userRoles is treated as an array (handles single string fallback too)
    const userRoles = Array.isArray(req.user.role)
      ? req.user.role
      : [req.user.role];

    // Check if the user has AT LEAST ONE of the required allowedRoles
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      return resp.status(403).json({
        message: "You do not have permission to access this resource",
      });
    }

    next();
  };
};

module.exports = authorize;
