import express from "express";
import {
  protect,
  requireActive,
  requireNotFrozen,
  requireKycApproved 
} from "../middleware/auth.js";
import {
  transferInternal,
  transferExternal,
  transferInternational,
  transferZelle,
  transferPaypal,
  getMyTransactions,
  getTransactionById,
  addBeneficiary,
  getBeneficiaries,
  deleteBeneficiary,
} from "../controllers/transactionController.js";

const router = express.Router();

router.use(protect);

// Moving money — blocked while frozen or not KYC-verified
router.post("/transfer/internal", requireNotFrozen, requireKycApproved, transferInternal);
router.post("/transfer/external", requireNotFrozen, requireKycApproved, transferExternal);
router.post("/transfer/international", requireNotFrozen, requireKycApproved, transferInternational);
router.post("/transfer/zelle", requireNotFrozen, requireKycApproved, transferZelle);
router.post("/transfer/paypal", requireNotFrozen, requireKycApproved, transferPaypal);

// Viewing/managing saved data — allowed while frozen
router.get("/me", requireActive, getMyTransactions);
router.get("/beneficiaries", requireActive, getBeneficiaries);
router.post("/beneficiaries", requireActive, addBeneficiary);
router.delete("/beneficiaries/:id", requireActive, deleteBeneficiary);
router.get("/:id", requireActive, getTransactionById);

export default router;
