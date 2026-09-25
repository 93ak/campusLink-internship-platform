import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

import Student from "../models/Student.js";
import Professor from "../models/Professor.js";
import Company from "../models/Company.js";
import Listing from "../models/Listing.js";
import Application from "../models/Application.js";
import Interview from "../models/Interview.js";
import Internship from "../models/Internship.js";
import Notification from "../models/Notification.js";

import {
  students,
  professors,
  companies,
  listings,
  applications,
  interviews,
  internships,
  notifications,
} from "./seedData.js";

async function run() {
  await connectDB(process.env.MONGODB_URI);

  console.log("[seed] Clearing existing collections...");
  await Promise.all([
    Student.deleteMany({}),
    Professor.deleteMany({}),
    Company.deleteMany({}),
    Listing.deleteMany({}),
    Application.deleteMany({}),
    Interview.deleteMany({}),
    Internship.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log("[seed] Inserting seed data...");
  await Professor.insertMany(professors);
  await Student.insertMany(students);
  await Company.insertMany(companies);
  await Listing.insertMany(listings);
  await Application.insertMany(applications);
  await Interview.insertMany(interviews);
  await Internship.insertMany(internships);
  await Notification.insertMany(notifications);

  console.log("[seed] Done. Seeded:");
  console.log(`  ${professors.length} professors`);
  console.log(`  ${students.length} students`);
  console.log(`  ${companies.length} companies`);
  console.log(`  ${listings.length} listings`);
  console.log(`  ${applications.length} applications`);
  console.log(`  ${interviews.length} interviews`);
  console.log(`  ${internships.length} internships`);
  console.log(`  ${notifications.length} notifications`);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});
