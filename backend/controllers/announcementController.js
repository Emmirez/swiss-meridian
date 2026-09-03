import Announcement from "../models/Announcement.js";
import User from "../models/User.js";
import { notifyGeneral } from "../utils/notify.js";

// ---- USER ----

// @route GET /api/announcements/mine
// Returns active announcements targeted at "all" or specifically at this
// user, excluding ones this user has already dismissed.
export const getMyAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({
      $or: [{ targetType: "all" }, { targetType: "specific", targetUser: req.user._id }],
      dismissedBy: { $ne: req.user._id },
    }).sort({ createdAt: -1 });

    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch announcements" });
  }
};

// @route PUT /api/announcements/:id/dismiss
export const dismissAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndUpdate(req.params.id, {
      $addToSet: { dismissedBy: req.user._id },
    });
    return res.json({ message: "Dismissed" });
  } catch (error) {
    return res.status(500).json({ message: "Could not dismiss announcement" });
  }
};

// ---- ADMIN ----

// @route GET /api/admin/announcements
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate("targetUser", "firstName lastName email")
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });
    return res.json({ announcements });
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch announcements" });
  }
};

// @route POST /api/admin/announcements
export const createAnnouncement = async (req, res) => {
  try {
    const { title, message, targetType, targetUserId, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }
    if (targetType === "specific" && !targetUserId) {
      return res.status(400).json({ message: "Please select a user to target" });
    }

    const announcement = await Announcement.create({
      title,
      message,
      targetType: targetType || "all",
      targetUser: targetType === "specific" ? targetUserId : undefined,
      priority: priority || "info",
      createdBy: req.user._id,
    });

    // Fan out a notification to whoever this targets
    if (targetType === "specific") {
      const user = await User.findById(targetUserId);
      if (user) {
        await notifyGeneral(user, {
          title: `Announcement: ${title}`,
          message,
          type: "account",
        });
      }
    } else {
      const users = await User.find({ role: "user" });
      for (const user of users) {
        await notifyGeneral(user, {
          title: `Announcement: ${title}`,
          message,
          type: "account",
        });
      }
    }

    return res.status(201).json({ message: "Announcement created", announcement });
  } catch (error) {
    console.error("Create announcement error:", error);
    return res.status(500).json({ message: "Could not create announcement" });
  }
};

// @route PUT /api/admin/announcements/:id
export const updateAnnouncement = async (req, res) => {
  try {
    const { title, message, priority } = req.body;
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    if (title !== undefined) announcement.title = title;
    if (message !== undefined) announcement.message = message;
    if (priority !== undefined) announcement.priority = priority;
    await announcement.save();

    return res.json({ message: "Announcement updated", announcement });
  } catch (error) {
    return res.status(500).json({ message: "Could not update announcement" });
  }
};

// @route DELETE /api/admin/announcements/:id
export const deleteAnnouncement = async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    return res.json({ message: "Announcement deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Could not delete announcement" });
  }
};