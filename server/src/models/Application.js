import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const ApplicationSchema = new Schema(
  {
    _id: { type: String },
    studentId: { type: String, ref: "Student", required: true },
    listingId: { type: String, ref: "Listing", required: true },
    status: {
      type: String,
      enum: ["Applied", "Shortlisted", "Interview Scheduled", "Selected", "Rejected", "Withdrawn"],
      default: "Applied",
    },
    appliedDate: String,
    lastUpdated: String,
  },
  { timestamps: true }
);

ApplicationSchema.plugin(toJSONPlugin);
export default mongoose.model("Application", ApplicationSchema);
