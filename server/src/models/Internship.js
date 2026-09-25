import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const DocumentSchema = new Schema(
  {
    id: String,
    type: String,
    name: { type: String, default: null },
    uploaded: { type: Boolean, default: false },
  },
  { _id: false }
);

const InternshipSchema = new Schema(
  {
    _id: { type: String },
    studentId: { type: String, ref: "Student", required: true },
    applicationId: { type: String, ref: "Application", required: true },
    listingId: { type: String, ref: "Listing", required: true },
    companyId: { type: String, ref: "Company", required: true },
    position: String,
    startDate: String,
    endDate: String,
    duration: String,
    stipend: String,
    supervisor: String,
    status: { type: String, enum: ["Upcoming", "Ongoing", "Completed"], default: "Upcoming" },
    verificationStatus: {
      type: String,
      enum: ["Pending Verification", "Verified", "Needs Correction"],
      default: "Pending Verification",
    },
    verificationNote: String,
    documents: { type: [DocumentSchema], default: [] },
  },
  { timestamps: true }
);

InternshipSchema.plugin(toJSONPlugin);
export default mongoose.model("Internship", InternshipSchema);
