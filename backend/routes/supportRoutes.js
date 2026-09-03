import express from "express";
import { protect, requireActive } from "../middleware/auth.js";
import {
  createTicket,
  getMyTickets,
  getMyTicketById,
  replyToTicketAsUser,
} from "../controllers/supportController.js";

const router = express.Router();

router.use(protect, requireActive);

router.post("/tickets", createTicket);
router.get("/tickets", getMyTickets);
router.get("/tickets/:id", getMyTicketById);
router.post("/tickets/:id/reply", replyToTicketAsUser);

export default router;