const roleMiddleware = (requiredRole) => {
  return (req, res, next) => {
    const { role } = req.user; // from authMiddleware
    if (role !== requiredRole) {
      return res.status(403).json({ message: `Requires ${requiredRole} role` });
    }
    next();
  };
};

module.exports = { roleMiddleware };