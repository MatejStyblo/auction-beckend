import express from "express";
import {login} from "../controllers/userController.js";
import  verifyToken  from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/login", login);
router.get("/getRole", verifyToken, (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role,
    username: req.user.username,
  });
});

export default router;
