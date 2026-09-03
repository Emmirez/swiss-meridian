import express from "express";
import { protect, requireActive, requireNotFrozen, requireKycApproved } from "../middleware/auth.js";
import { uploadKycDocument } from "../middleware/upload.js";
import { uploadAvatarImage } from "../middleware/uploadAvatar.js";
import {
  getDashboard,
  updateProfile,
  updateNotificationPrefs,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllNotifications,
  getKycStatus,
  uploadKyc,
  changePassword,
  changePin,
  getTwoFactorStatus,
  setupTwoFactor,
  verifyTwoFactorSetup,
  disableTwoFactor,
  uploadAvatar,
  getAccountLimits,
  getSpendingTrends,
  downloadStatement,
} from "../controllers/userController.js";
import {
  getMyCard,
  requestCard,
  updateCardSettings,
  toggleFreeze,
} from "../controllers/cardController.js";

const router = express.Router();

router.use(protect);

router.get("/dashboard", requireActive, getDashboard);
router.put("/profile", updateProfile);
router.put("/notification-preferences", updateNotificationPrefs);
router.get("/notifications", getNotifications);
router.put("/notifications/read-all", markAllNotificationsRead);
router.put("/notifications/:id/read", markNotificationRead);
router.delete("/notifications", deleteAllNotifications);
router.delete("/notifications/:id", deleteNotification);
router.get("/kyc", getKycStatus);
router.post("/kyc", uploadKycDocument, uploadKyc);

router.post("/avatar", uploadAvatarImage, uploadAvatar);
router.get("/limits", getAccountLimits);
router.get("/spending-trends", getSpendingTrends);
router.get("/statement", downloadStatement);
router.get("/card", getMyCard);
router.post("/card/request", requireNotFrozen, requireKycApproved, requestCard);
router.put("/card/settings", updateCardSettings);
router.put("/card/freeze", toggleFreeze);
router.put("/change-password", changePassword);
router.put("/change-pin", changePin);
router.get("/2fa/status", getTwoFactorStatus);
router.post("/2fa/setup", setupTwoFactor);
router.post("/2fa/verify-setup", verifyTwoFactorSetup);
router.post("/2fa/disable", disableTwoFactor);

export default router;
