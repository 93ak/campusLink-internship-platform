import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const InterviewSchema = new Schema(
  {
    _id: { type: String },
    applicationId: { type: String, ref: "Application", required: true },
    studentId: { type: String, ref: "Student", required: true },
    listingId: { type: String, ref: "Listing", required: true },
    round: String,
    date: String,
    time: String,
    mode: { type: String, enum: ["Online", "On-site"], default: "Online" },
    locationOrLink: String,
    instructions: String,
    status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Scheduled" },
  },
  { timestamps: true }
);

InterviewSchema.plugin(toJSONPlugin);
export default mongoose.model("Interview", InterviewSchema);
