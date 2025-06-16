import jwt from "jsonwebtoken";
import User from "../models/User.js";

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: "Chybí token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 👇 Kontrola existence uživatele v DB
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ error: "Uživatel neexistuje" });

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Neplatný token" });
  }
};

export default verifyToken;
