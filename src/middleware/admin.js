const admin = (userAdmin = (...roles) => {
  try {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          res
            .status(403)
            .json(
              `Role: ${req.user.role} is not allowed to access this resource`
            )
        );
      }
      next();
    };
  } catch (e) {
    res.status(403).send(e);
  }
});

module.exports = admin;
