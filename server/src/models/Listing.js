import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const ListingSchema = new Schema(
  {
    _id: { type: String },
    companyId: { type: String, ref: "Company", required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["Internship", "Job"], default: "Internship" },
    description: String,
    responsibilities: { type: [String], default: [] },
    requirements: { type: [String], default: [] },
    skills: { type: [String], default: [] },
    eligibleDepartments: { type: [String], default: [] },
    eligibleYears: { type: [String], default: [] },
    minCgpa: { type: Number, default: 0 },
    location: String,
    workMode: { type: String, enum: ["Remote", "On-site", "Hybrid"], default: "On-site" },
    duration: String,
    stipend: String,
    paid: { type: Boolean, default: true },
    openings: { type: Number, default: 1 },
    filledCount: { type: Number, default: 0 },
    deadline: String, // stored as "YYYY-MM-DD" to match the frontend's date helpers
    contactEmail: String,
    status: {
      type: String,
      enum: ["Draft", "Pending Approval", "Approved", "Rejected", "Closed", "Filled"],
      default: "Draft",
    },
    rejectionReason: String,
    changeFeedback: String,
    createdDate: String,
  },
  { timestamps: true }
);

ListingSchema.plugin(toJSONPlugin);
export default mongoose.model("Listing", ListingSchema);
