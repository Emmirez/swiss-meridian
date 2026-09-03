import express from "express";
import { protect, requireActive } from "../middleware/auth.js";
import { getMyAnnouncements, dismissAnnouncement } from "../controllers/announcementController.js";

const router = express.Router();

router.use(protect, requireActive);

router.get("/mine", getMyAnnouncements);
router.put("/:id/dismiss", dismissAnnouncement);

export default router;