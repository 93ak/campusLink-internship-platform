import { Router } from "express";
import Company from "../models/Company.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(await Company.find().sort({ name: 1 }));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const allowed = [
      "name", "website", "industry", "location", "size", "description",
      "hrContactName", "hrEmail", "hrPhone", "logoInitials",
    ];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

    const company = await Company.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  })
);

export default router;
