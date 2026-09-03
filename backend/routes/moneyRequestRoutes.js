import express from "express";
import { protect, requireActive, requireNotFrozen, requireKycApproved } from "../middleware/auth.js";
import {
  createMoneyRequest,
  getSentRequests,
  getReceivedRequests,
  approveMoneyRequest,
  declineMoneyRequest,
  cancelMoneyRequest,
} from "../controllers/moneyRequestController.js";

const router = express.Router();

router.use(protect);

router.post("/", requireActive, requireKycApproved, createMoneyRequest);
router.get("/sent", requireActive, getSentRequests);
router.get("/received", requireActive, getReceivedRequests);
router.post("/:id/approve", requireNotFrozen, requireKycApproved, approveMoneyRequest);
router.post("/:id/decline", requireActive, declineMoneyRequest);
router.post("/:id/cancel", requireActive, cancelMoneyRequest);

export default router;