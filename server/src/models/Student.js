import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const ProjectSchema = new Schema({ title: String, desc: String }, { _id: false });

const StudentSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    registerNumber: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    department: { type: String, required: true },
    year: { type: String, required: true },
    cgpa: { type: Number, default: 0 },
    skills: { type: [String], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    github: String,
    linkedin: String,
    resumeUploaded: { type: Boolean, default: false },
    resumeName: { type: String, default: null },
    photoInitials: String,
    professorId: { type: String, ref: "Professor" },
    savedListingIds: { type: [String], default: [] },
  },
  { timestamps: true }
);

StudentSchema.plugin(toJSONPlugin);
export default mongoose.model("Student", StudentSchema);
