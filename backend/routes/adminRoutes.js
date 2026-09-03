import express from "express";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getAdminStats,
  getAllUsers,
  getUserById,
  approveUser,
  rejectUser,
  updateUserStatus,
  updateUserLimits,
  adjustBalance,
  getAllTransactions,
  updateTransaction,
  getAuditLogs,
  getKycSubmissions,
  approveKyc,
  rejectKyc,
} from "../controllers/adminController.js";
import {
  getAllTickets,
  getTicketByIdAdmin,
  replyToTicketAsAdmin,
  closeTicket,
  reopenTicket,
} from "../controllers/supportController.js";
import {
  getCardRequests,
  approveCard,
  rejectCard,
} from "../controllers/cardController.js";
import {
  getLoanApplications,
  approveLoan,
  rejectLoan,
} from "../controllers/loanController.js";
import {
  getGrantApplications,
  approveGrant,
  rejectGrant,
} from "../controllers/grantController.js";
import {
  getTaxRefundApplications,
  approveTaxRefund,
  rejectTaxRefund,
} from "../controllers/taxRefundController.js";

import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id/approve", approveUser);
router.put("/users/:id/reject", rejectUser);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/limits", updateUserLimits);
router.post("/users/:id/adjust", adjustBalance);
router.get("/transactions", getAllTransactions);
router.put("/transactions/:id", updateTransaction);
router.get("/audit-logs", getAuditLogs);
router.get("/kyc", getKycSubmissions);
router.put("/kyc/:id/approve", approveKyc);
router.put("/kyc/:id/reject", rejectKyc);
router.get("/tickets", getAllTickets);
router.get("/tickets/:id", getTicketByIdAdmin);
router.post("/tickets/:id/reply", replyToTicketAsAdmin);
router.put("/tickets/:id/close", closeTicket);
router.put("/tickets/:id/reopen", reopenTicket);
router.get("/cards", getCardRequests);
router.put("/cards/:id/approve", approveCard);
router.put("/cards/:id/reject", rejectCard);

router.get("/loans", getLoanApplications);
router.put("/loans/:id/approve", approveLoan);
router.put("/loans/:id/reject", rejectLoan);

router.get("/grants", getGrantApplications);
router.put("/grants/:id/approve", approveGrant);
router.put("/grants/:id/reject", rejectGrant);

router.get("/tax-refunds", getTaxRefundApplications);
router.put("/tax-refunds/:id/approve", approveTaxRefund);
router.put("/tax-refunds/:id/reject", rejectTaxRefund);

router.get("/announcements", getAllAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:id", updateAnnouncement);
router.delete("/announcements/:id", deleteAnnouncement);

export default router;