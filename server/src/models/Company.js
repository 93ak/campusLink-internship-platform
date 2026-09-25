import mongoose from "mongoose";
import { toJSONPlugin } from "./plugins/toJSON.js";

const { Schema } = mongoose;

const CompanySchema = new Schema(
  {
    _id: { type: String },
    name: { type: String, required: true },
    website: String,
    industry: String,
    location: String,
    size: String,
    description: String,
    hrContactName: String,
    hrEmail: String,
    hrPhone: String,
    logoInitials: String,
    verified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CompanySchema.plugin(toJSONPlugin);
export default mongoose.model("Company", CompanySchema);
