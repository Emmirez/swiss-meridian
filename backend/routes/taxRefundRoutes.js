import express from "express";
import { protect, requireActive, requireNotFrozen,  requireKycApproved} from "../middleware/auth.js";
import { applyForTaxRefund, getMyTaxRefunds } from "../controllers/taxRefundController.js";

const router = express.Router();

router.use(protect);

router.post("/apply", requireNotFrozen, requireKycApproved, applyForTaxRefund);
router.get("/mine", requireActive, getMyTaxRefunds);

export default router;