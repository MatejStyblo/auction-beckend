import express from "express";

import upload from "../middleware/upload.js";

import {
  getAuctionInfo,
  setAuctionDuration,
  deleteUser,
  changePassword,
  getAllUsers,
  adminCreateUser,
  register,
  setMinimumBid,
  deleteBidById,
  deleteAllBids,
  uploadAuctionImage,
  getAuctionImage,
  deleteAuctionImage,
} from "../controllers/adminController.js";
import verifyToken from "../middleware/authMiddleware.js";
import isSuperAdmin from "../middleware/isSuperAdmin.js";
const router = express.Router();

router.post("/register", register);
router.post("/create-user", verifyToken, isSuperAdmin, adminCreateUser);
router.get("/getRole", verifyToken, (req, res) => {
  res.json({
    userId: req.user.userId,
    role: req.user.role,
    username: req.user.username,
  });
});
router.put("/:userId/password", verifyToken, isSuperAdmin, changePassword);
router.get("/", verifyToken, isSuperAdmin, getAllUsers);
router.delete("/user/:id", verifyToken, isSuperAdmin, deleteUser);
router.get("/info", getAuctionInfo);

router.post("/set-auction", verifyToken, isSuperAdmin, setAuctionDuration);
router.post("/set-minimum-bid", verifyToken, isSuperAdmin, setMinimumBid);
router.post("/upload-image", upload.single("image"), uploadAuctionImage);
router.get("/image", getAuctionImage);

router.delete("/bids/:id", verifyToken, isSuperAdmin, deleteBidById);
router.delete("/allBids", verifyToken, isSuperAdmin, deleteAllBids);
router.delete("/delete-image", verifyToken, isSuperAdmin, deleteAuctionImage);
export default router;
