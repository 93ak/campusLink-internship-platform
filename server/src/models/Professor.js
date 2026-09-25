import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const ProfessorSchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    department: { type: String, required: true },
    designation: String,
    photoInitials: String,
  },
  { timestamps: true }
);

ProfessorSchema.plugin(toJSONPlugin);
export default mongoose.model("Professor", ProfessorSchema);
