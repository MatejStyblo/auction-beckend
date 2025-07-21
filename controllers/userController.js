import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

export const login = async (req, res) => {
  const { username, password, userId } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(401).json({ error: "Špatné údaje" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Špatné údaje" });

  const token = jwt.sign(
    { userId: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
  

  res.json({ token, username: user.username, role: user.role });
};
