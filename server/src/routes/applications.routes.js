import { Router } from "express";
import Application from "../models/Application.js";
import Listing from "../models/Listing.js";
import Internship from "../models/Internship.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { genId } from "../utils/genId.js";

const router = Router();
const today = () => new Date().toISOString().slice(0, 10);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.studentId) filter.studentId = req.query.studentId;
    if (req.query.listingId) filter.listingId = req.query.listingId;

    // companyId isn't a field on Application, so resolve it via the company's listings first.
    if (req.query.companyId) {
      const listings = await Listing.find({ companyId: req.query.companyId }, "_id");
      filter.listingId = { $in: listings.map((l) => l.id) };
    }

    res.json(await Application.find(filter).sort({ appliedDate: -1 }));
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  })
);

// Student applies to a listing.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { studentId, listingId } = req.body;
    if (!studentId || !listingId) return res.status(400).json({ error: "studentId and listingId are required" });

    const existing = await Application.findOne({ studentId, listingId, status: { $ne: "Withdrawn" } });
    if (existing) return res.status(409).json({ error: "You have already applied to this opportunity." });

    const application = await Application.create({
      _id: genId("app"),
      studentId,
      listingId,
      status: "Applied",
      appliedDate: today(),
      lastUpdated: today(),
    });
    res.status(201).json(application);
  })
);

router.patch(
  "/:id/withdraw",
  asyncHandler(async (req, res) => {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Withdrawn", lastUpdated: today() },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  })
);

router.patch(
  "/:id/shortlist",
  asyncHandler(async (req, res) => {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Shortlisted", lastUpdated: today() },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  })
);

router.patch(
  "/:id/reject",
  asyncHandler(async (req, res) => {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected", lastUpdated: today() },
      { new: true }
    );
    if (!application) return res.status(404).json({ error: "Application not found" });
    res.json(application);
  })
);

// Company HR selects a candidate: application -> Selected, listing openings
// fill count increments (and may auto-close), and a new internship record is
// created with the standard starter document checklist.
router.post(
  "/:id/select",
  asyncHandler(async (req, res) => {
    const { startDate, endDate, stipend, supervisor } = req.body;

    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ error: "Application not found" });

    const listing = await Listing.findById(application.listingId);
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    application.status = "Selected";
    application.lastUpdated = today();
    await application.save();

    listing.filledCount = (listing.filledCount || 0) + 1;
    if (listing.filledCount >= listing.openings) listing.status = "Filled";
    await listing.save();

    const internship = await Internship.create({
      _id: genId("in"),
      studentId: application.studentId,
      applicationId: application.id,
      listingId: listing.id,
      companyId: listing.companyId,
      position: listing.title,
      startDate,
      endDate,
      duration: listing.duration,
      stipend: stipend || listing.stipend,
      supervisor: supervisor || "To be assigned",
      status: "Upcoming",
      verificationStatus: "Pending Verification",
      documents: [
        { id: genId("doc"), type: "Offer Letter", name: `${listing.title.replace(/\s+/g, "_")}_Offer.pdf`, uploaded: true },
        { id: genId("doc"), type: "Joining Letter", name: null, uploaded: false },
        { id: genId("doc"), type: "Completion Certificate", name: null, uploaded: false },
      ],
    });

    res.json({ application, listing, internship });
  })
);

export default router;
