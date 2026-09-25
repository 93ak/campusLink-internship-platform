import { Router } from "express";
import Student from "../models/Student.js";
import Professor from "../models/Professor.js";
import Company from "../models/Company.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { initialsOf } from "../utils/genId.js";

const router = Router();

// No JWT / passwords in this prototype: the demo login just hands back a
// seeded account for the chosen role. Swap this for real auth later without
// touching any other route.
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { role } = req.body;

    if (role === "student") {
      const s = await Student.findOne().sort({ _id: 1 });
      if (!s) return res.status(404).json({ error: "No seeded students found. Run `npm run seed`." });
      return res.json({ role: "student", id: s.id, name: s.name, email: s.email, initials: s.photoInitials });
    }

    if (role === "professor") {
      const p = await Professor.findOne().sort({ _id: 1 });
      if (!p) return res.status(404).json({ error: "No seeded professors found. Run `npm run seed`." });
      return res.json({ role: "professor", id: p.id, name: p.name, email: p.email, initials: p.photoInitials });
    }

    if (role === "company") {
      const c = await Company.findOne().sort({ _id: 1 });
      if (!c) return res.status(404).json({ error: "No seeded companies found. Run `npm run seed`." });
      return res.json({
        role: "company",
        id: c.id,
        name: c.hrContactName,
        companyId: c.id,
        companyName: c.name,
        email: c.hrEmail,
        initials: initialsOf(c.hrContactName || c.name),
      });
    }

    res.status(400).json({ error: "role must be 'student', 'professor', or 'company'" });
  })
);

export default router;
