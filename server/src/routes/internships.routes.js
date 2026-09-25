import { Router } from "express";
import Internship from "../models/Internship.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    res.json(await Internship.find(filter));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: "Internship not found" });
    res.json(internship);
  })
);

// Upload a document into one of the internship's checklist slots (Offer
// Letter / Joining Letter / Completion Certificate / Other).
router.post(
  "/:id/documents",
  asyncHandler(async (req, res) => {
    const { docId, name } = req.body;
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: "Internship not found" });

    const doc = internship.documents.find((d) => d.id === docId);
    if (!doc) return res.status(404).json({ error: "Document slot not found" });

    doc.uploaded = true;
    doc.name = name;
    await internship.save();
    res.json(internship);
  })
);

router.delete(
  "/:id/documents/:docId",
  asyncHandler(async (req, res) => {
    const internship = await Internship.findById(req.params.id);
    if (!internship) return res.status(404).json({ error: "Internship not found" });

    const doc = internship.documents.find((d) => d.id === req.params.docId);
    if (!doc) return res.status(404).json({ error: "Document slot not found" });

    doc.uploaded = false;
    doc.name = null;
    await internship.save();
    res.json(internship);
  })
);

router.patch(
  "/:id/verify",
  asyncHandler(async (req, res) => {
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "Verified", verificationNote: "" },
      { new: true }
    );
    if (!internship) return res.status(404).json({ error: "Internship not found" });
    res.json(internship);
  })
);

router.patch(
  "/:id/reject-verification",
  asyncHandler(async (req, res) => {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "A reason is required" });
    const internship = await Internship.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: "Needs Correction", verificationNote: reason },
      { new: true }
    );
    if (!internship) return res.status(404).json({ error: "Internship not found" });
    res.json(internship);
  })
);

export default router;
