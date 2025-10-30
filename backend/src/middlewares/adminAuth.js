/**
 * Admin authorization middleware
 * Ensures only admin users can access admin routes
 */

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

export default isAdmin;


