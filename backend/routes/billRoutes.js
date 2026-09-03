import express from "express";
import {
  protect,
  requireActive,
  requireNotFrozen,
  requireKycApproved 
} from "../middleware/auth.js";
import {
  getBillers,
  addBiller,
  deleteBiller,
  payBill,
} from "../controllers/billController.js";

const router = express.Router();

router.use(protect);

router.get("/billers", requireActive, getBillers);
router.post("/billers", requireActive, addBiller);
router.delete("/billers/:id", requireActive, deleteBiller);
router.post("/pay", requireNotFrozen, requireKycApproved, payBill);

export default router;
