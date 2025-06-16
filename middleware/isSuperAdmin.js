const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "superadmin") {
    return res.status(403).json({ error: "Přístup zakázán" });
  }
  next();
};

export default isSuperAdmin;
