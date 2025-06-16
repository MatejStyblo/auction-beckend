import express from "express";
import {
  createBid,
  getBids,
  setPrice,
  getPrice,
} from "../controllers/bidController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createBid);
router.get("/", verifyToken, getBids);
router.get("/price", verifyToken, getPrice);
router.post("/price", verifyToken, setPrice); 

export default router;
