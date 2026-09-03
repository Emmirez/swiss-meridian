import SupportTicket from "../models/SupportTicket.js";
import User from "../models/User.js";
import { notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route POST /api/support/tickets
export const createTicket = async (req, res) => {
  try {
    const { subject, category, priority, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      category: category || "Other",
      priority: priority || "medium",
      status: "open",
      messages: [{ sender: "user", senderId: req.user._id, text: message }],
      lastReplyBy: "user",
    });

    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await notifyGeneral(admin, {
        title: "New support ticket",
        message: `${req.user.firstName} ${req.user.lastName} opened a ticket: "${subject}"`,
        type: "general",
      });
    }

    return res.status(201).json({ ticket });
  } catch (error) {
    console.error("Create ticket error:", error);
    return res.status(500).json({ message: "Could not create ticket" });
  }
};

// @route GET /api/support/tickets
export const getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ user: req.user._id }).sort({ updatedAt: -1 });
    return res.json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tickets" });
  }
};

// @route GET /api/support/tickets/:id
export const getMyTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch ticket" });
  }
};

// @route POST /api/support/tickets/:id/reply
export const replyToTicketAsUser = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await SupportTicket.findOne({ _id: req.params.id, user: req.user._id });
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    if (ticket.status === "closed") ticket.status = "open";

    ticket.messages.push({ sender: "user", senderId: req.user._id, text: message });
    ticket.lastReplyBy = "user";
    await ticket.save();

    const admins = await User.find({ role: "admin" });
    for (const admin of admins) {
      await notifyGeneral(admin, {
        title: "New reply on support ticket",
        message: `${req.user.firstName} ${req.user.lastName} replied to "${ticket.subject}"`,
        type: "general",
      });
    }

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not send reply" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/tickets?status=open
export const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const tickets = await SupportTicket.find(filter)
      .populate("user", "firstName lastName email accountNumber")
      .sort({ updatedAt: -1 });
    return res.json({ tickets });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch tickets" });
  }
};

// @route GET /api/admin/tickets/:id
export const getTicketByIdAdmin = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate("user", "firstName lastName email accountNumber");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch ticket" });
  }
};

// @route POST /api/admin/tickets/:id/reply
export const replyToTicketAsAdmin = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const ticket = await SupportTicket.findById(req.params.id).populate("user");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.messages.push({ sender: "admin", senderId: req.user._id, text: message });
    ticket.lastReplyBy = "admin";
    await ticket.save();

    await notifyGeneral(ticket.user, {
      title: "Support replied to your ticket",
      message: `Our team responded to "${ticket.subject}"`,
      type: "general",
      email: true,
    });

    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not send reply" });
  }
};

// @route PUT /api/admin/tickets/:id/close
export const closeTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    ticket.status = "closed";
    await ticket.save();
    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not close ticket" });
  }
};

// @route PUT /api/admin/tickets/:id/reopen
export const reopenTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    ticket.status = "open";
    await ticket.save();
    return res.json({ ticket });
  } catch (error) {
    return res.status(500).json({ message: "Could not reopen ticket" });
  }
};