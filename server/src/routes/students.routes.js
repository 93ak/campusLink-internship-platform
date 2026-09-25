import { Router } from "express";
import Student from "../models/Student.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.professorId) filter.professorId = req.query.professorId;
    const students = await Student.find(filter).sort({ name: 1 });
    res.json(students);
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  })
);

// Profile edit (phone, department, year, cgpa, skills, github, linkedin, ...)
router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const allowed = ["phone", "department", "year", "cgpa", "skills", "github", "linkedin", "photoInitials"];
    const updates = {};
    for (const key of allowed) if (key in req.body) updates[key] = req.body[key];

    const student = await Student.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  })
);

router.patch(
  "/:id/resume",
  asyncHandler(async (req, res) => {
    const { resumeName } = req.body;
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { resumeUploaded: true, resumeName },
      { new: true }
    );
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  })
);

// Toggle a listing in/out of the student's saved list.
router.patch(
  "/:id/saved-listings",
  asyncHandler(async (req, res) => {
    const { listingId } = req.body;
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: "Student not found" });

    const isSaved = student.savedListingIds.includes(listingId);
    student.savedListingIds = isSaved
      ? student.savedListingIds.filter((id) => id !== listingId)
      : [...student.savedListingIds, listingId];
    await student.save();
    res.json(student);
  })
);

export default router;
