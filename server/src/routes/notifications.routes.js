import { Router } from "express";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.ownerId) filter.ownerId = req.query.ownerId;
    res.json(await Notification.find(filter).sort({ date: -1 }));
  })
);

router.patch(
  "/:id/read",
  asyncHandler(async (req, res) => {
    const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  })
);

// Marks every notification for one specific user (role + ownerId) as read.
router.patch(
  "/read-all",
  asyncHandler(async (req, res) => {
    const { role, ownerId } = req.body;
    if (!role || !ownerId) return res.status(400).json({ error: "role and ownerId are required" });

    await Notification.updateMany({ role, ownerId }, { read: true });
    const updated = await Notification.find({ role, ownerId }).sort({ date: -1 });
    res.json(updated);
  })
);

export default router;
