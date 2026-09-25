import { Router } from "express";
import Interview from "../models/Interview.js";
import Application from "../models/Application.js";
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
    if (req.query.applicationId) filter.applicationId = req.query.applicationId;
    res.json(await Interview.find(filter).sort({ date: 1 }));
  })
);

// Company HR schedules an interview for a shortlisted applicant. This also
// moves the application into "Interview Scheduled".
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { applicationId, round, date, time, mode, locationOrLink, instructions } = req.body;
    if (!applicationId) return res.status(400).json({ error: "applicationId is required" });

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ error: "Application not found" });

    const interview = await Interview.create({
      _id: genId("intv"),
      applicationId,
      studentId: application.studentId,
      listingId: application.listingId,
      round,
      date,
      time,
      mode,
      locationOrLink,
      instructions,
      status: "Scheduled",
    });

    application.status = "Interview Scheduled";
    application.lastUpdated = today();
    await application.save();

    res.status(201).json({ interview, application });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const allowed = ["round", "date", "time", "mode", "locationOrLink", "instructions"];
    const updates = { status: "Scheduled" };
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

    const interview = await Interview.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  })
);

router.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const interview = await Interview.findByIdAndUpdate(req.params.id, { status: "Cancelled" }, { new: true });
    if (!interview) return res.status(404).json({ error: "Interview not found" });
    res.json(interview);
  })
);

export default router;
