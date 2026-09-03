import express from "express";
import { protect, requireActive, requireNotFrozen, requireKycApproved } from "../middleware/auth.js";
import { getGrantCategories, applyForGrant, getMyGrants } from "../controllers/grantController.js";

const router = express.Router();

router.use(protect);

router.get("/categories", requireActive, getGrantCategories);
router.post("/apply", requireNotFrozen,requireKycApproved, applyForGrant);
router.get("/mine", requireActive, getMyGrants);

export default router;