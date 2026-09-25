import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

// A single collection for all three roles' notifications, distinguished by
// `role` + `ownerId` (the studentId / professorId / companyId it belongs to).
const NotificationSchema = new Schema(
  {
    _id: { type: String },
    role: { type: String, enum: ["student", "professor", "company"], required: true },
    ownerId: { type: String, required: true },
    type: String,
    title: String,
    message: String,
    date: String,
    read: { type: Boolean, default: false },
    link: String,
  },
  { timestamps: true }
);

NotificationSchema.plugin(toJSONPlugin);
export default mongoose.model("Notification", NotificationSchema);
