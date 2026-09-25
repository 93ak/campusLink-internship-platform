import { Router } from "express";
import Student from "../models/Student.js";
import Professor from "../models/Professor.js";
import Company from "../models/Company.js";
import Listing from "../models/Listing.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import Internship from "../models/Internship.js";
import Notification from "../models/Notification.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// The frontend keeps all mock-sized collections in memory (same shape as the
// original prototype), so a single combined fetch on app load is simplest.
// If this dataset grows large in a real deployment, split this into the
// per-resource GET routes below and fetch on demand instead.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [students, professors, companies, listings, applications, interviews, internships, notifications] =
      await Promise.all([
        Student.find().sort({ _id: 1 }),
        Professor.find().sort({ _id: 1 }),
        Company.find().sort({ _id: 1 }),
        Listing.find().sort({ createdDate: -1 }),
        Application.find(),
        Interview.find(),
        Internship.find(),
        Notification.find(),
      ]);

    res.json({
      students,
      professors,
      companies,
      listings,
      applications,
      interviews,
      internships,
      notifications,
    });
  })
);

export default router;
