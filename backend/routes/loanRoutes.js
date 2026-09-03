import express from "express";
import {
  protect,
  requireActive,
  requireNotFrozen,
  requireKycApproved,
} from "../middleware/auth.js";
import {
  getLoanRates,
  applyForLoan,
  getMyLoans,
} from "../controllers/loanController.js";

const router = express.Router();

router.use(protect);

router.get("/rates", requireActive, getLoanRates);
router.post("/apply", requireNotFrozen, requireKycApproved, applyForLoan);
router.get("/mine", requireActive, getMyLoans);

export default router;
