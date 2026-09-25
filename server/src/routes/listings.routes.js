import { Router } from "express";
import Listing from "../models/Listing.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { genId } from "../utils/genId.js";

const router = Router();

const EDITABLE_FIELDS = [
  "title", "type", "description", "responsibilities", "requirements", "skills",
  "eligibleDepartments", "eligibleYears", "minCgpa", "location", "workMode",
  "duration", "stipend", "paid", "openings", "deadline", "contactEmail",
];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.companyId) filter.companyId = req.query.companyId;
    if (req.query.status) filter.status = req.query.status;
    res.json(await Listing.find(filter).sort({ createdDate: -1 }));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

// Create a listing (Company HR). `submit: true` -> Pending Approval, else Draft.
// A new listing is NEVER visible to students until a professor approves it.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { companyId, submit, ...fields } = req.body;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const payload = {};
    for (const key of EDITABLE_FIELDS) if (key in fields) payload[key] = fields[key];

    const listing = await Listing.create({
      _id: genId("lst"),
      companyId,
      ...payload,
      filledCount: 0,
      createdDate: new Date().toISOString().slice(0, 10),
      status: submit ? "Pending Approval" : "Draft",
    });
    res.status(201).json(listing);
  })
);

// Edit a listing (only meaningful while it's a Draft — the frontend enforces
// this in the UI; kept permissive here to keep the API simple).
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const updates = {};
    for (const key of EDITABLE_FIELDS) if (key in req.body) updates[key] = req.body[key];

    const listing = await Listing.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

router.post(
  "/:id/submit",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "Pending Approval" },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

router.patch(
  "/:id/approve",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "Approved" }, { new: true });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

router.patch(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "A rejection reason is required" });
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", rejectionReason: reason },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

router.patch(
  "/:id/request-changes",
  asyncHandler(async (req, res) => {
    const { feedback } = req.body;
    if (!feedback) return res.status(400).json({ error: "Feedback is required" });
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "Draft", changeFeedback: feedback },
      { new: true }
    );
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

router.patch(
  "/:id/close",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(req.params.id, { status: "Closed" }, { new: true });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  })
);

export default router;
