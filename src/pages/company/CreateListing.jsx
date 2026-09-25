import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import EmptyState from "../../components/common/EmptyState";
import { DEPARTMENTS } from "../../data/mockData";

const YEARS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const EMPTY_FORM = {
  title: "", type: "Internship", description: "", responsibilities: "", requirements: "",
  eligibleDepartments: [], eligibleYears: [], minCgpa: "6.0", skills: "",
  location: "", workMode: "On-site", duration: "", stipend: "", paid: true,
  openings: "1", deadline: "", contactEmail: "",
};

export default function CreateListing() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();

  const existing = listingId ? data.getListing(listingId) : null;
  const isEdit = Boolean(existing);
  const isLocked = isEdit && existing.status !== "Draft";

  const [form, setForm] = useState(() =>
    existing
      ? {
          ...existing,
          responsibilities: existing.responsibilities.join("\n"),
          requirements: existing.requirements.join("\n"),
          skills: existing.skills.join(", "),
          minCgpa: String(existing.minCgpa),
          openings: String(existing.openings),
        }
      : { ...EMPTY_FORM, contactEmail: data.getCompany(user.companyId).hrEmail }
  );

  if (isEdit && !existing) return <EmptyState icon="❓" title="Listing not found" />;

  if (isLocked) {
    return (
      <div>
        <Breadcrumbs items={[{ label: "My Listings", to: "/company/listings" }, { label: "Edit" }]} />
        <EmptyState
          icon="🔒"
          title="This listing can no longer be edited"
          message={`'${existing.title}' has status '${existing.status}'. Only draft listings can be edited. Close this listing instead if you need to stop new applications.`}
          action={<button className="btn btn-secondary" onClick={() => navigate("/company/listings")}>Back to My Listings</button>}
        />
      </div>
    );
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleMulti = (key, value) => {
    setForm((f) => {
      const set = new Set(f[key]);
      set.has(value) ? set.delete(value) : set.add(value);
      return { ...f, [key]: Array.from(set) };
    });
  };

  const buildPayload = () => ({
    title: form.title,
    type: form.type,
    description: form.description,
    responsibilities: form.responsibilities.split("\n").map((s) => s.trim()).filter(Boolean),
    requirements: form.requirements.split("\n").map((s) => s.trim()).filter(Boolean),
    eligibleDepartments: form.eligibleDepartments,
    eligibleYears: form.eligibleYears,
    minCgpa: parseFloat(form.minCgpa) || 0,
    skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
    location: form.location,
    workMode: form.workMode,
    duration: form.duration,
    stipend: form.stipend,
    paid: form.paid === true || form.paid === "true",
    openings: parseInt(form.openings, 10) || 1,
    deadline: form.deadline,
    contactEmail: form.contactEmail,
  });

  const handleSaveDraft = async () => {
    if (isEdit) await data.editListing(existing.id, buildPayload());
    else await data.createListing(user.companyId, buildPayload(), false);
    navigate("/company/listings");
  };

  const handleSubmit = async () => {
    if (isEdit) {
      await data.editListing(existing.id, buildPayload());
      await data.submitDraftForApproval(existing.id);
    } else {
      await data.createListing(user.companyId, buildPayload(), true);
    }
    navigate("/company/listings");
  };

  const isValid = form.title && form.description && form.location && form.duration && form.deadline;

  return (
    <div>
      <Breadcrumbs items={[{ label: "My Listings", to: "/company/listings" }, { label: isEdit ? "Edit Listing" : "Create Listing" }]} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? "Edit Listing" : "Create Internship/Job Listing"}</h1>
          <p className="page-subtitle">Once submitted, a professor must approve this listing before students can see it.</p>
        </div>
      </div>

      <div className="card card-pad">
        <div className="form-grid">
          <div className="field">
            <label>Job / Internship Title</label>
            <input className="input" value={form.title} onChange={set("title")} placeholder="e.g. Frontend Engineering Intern" />
          </div>
          <div className="field">
            <label>Type</label>
            <select className="select" value={form.type} onChange={set("type")}>
              <option>Internship</option>
              <option>Job</option>
            </select>
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea className="textarea" value={form.description} onChange={set("description")} placeholder="Describe the role..." />
        </div>

        <div className="field">
          <label>Responsibilities</label>
          <textarea className="textarea" value={form.responsibilities} onChange={set("responsibilities")} placeholder="One per line" />
          <div className="hint">Enter one responsibility per line.</div>
        </div>

        <div className="field">
          <label>Requirements</label>
          <textarea className="textarea" value={form.requirements} onChange={set("requirements")} placeholder="One per line" />
          <div className="hint">Enter one requirement per line.</div>
        </div>

        <div className="field">
          <label>Eligible Departments</label>
          <div className="flex gap-12 wrap">
            {DEPARTMENTS.map((d) => (
              <label key={d} className="checkbox-row">
                <input type="checkbox" checked={form.eligibleDepartments.includes(d)} onChange={() => toggleMulti("eligibleDepartments", d)} />
                {d}
              </label>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Eligible Years</label>
          <div className="flex gap-12 wrap">
            {YEARS.map((y) => (
              <label key={y} className="checkbox-row">
                <input type="checkbox" checked={form.eligibleYears.includes(y)} onChange={() => toggleMulti("eligibleYears", y)} />
                {y}
              </label>
            ))}
          </div>
        </div>

        <div className="form-grid">
          <div className="field"><label>Minimum CGPA</label><input className="input" type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={set("minCgpa")} /></div>
          <div className="field"><label>Required Skills</label><input className="input" value={form.skills} onChange={set("skills")} placeholder="React, Node.js, SQL" /></div>
        </div>

        <div className="form-grid">
          <div className="field"><label>Location</label><input className="input" value={form.location} onChange={set("location")} placeholder="e.g. Bengaluru, India" /></div>
          <div className="field">
            <label>Work Mode</label>
            <select className="select" value={form.workMode} onChange={set("workMode")}>
              <option>On-site</option><option>Remote</option><option>Hybrid</option>
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="field"><label>Duration</label><input className="input" value={form.duration} onChange={set("duration")} placeholder="e.g. 6 months" /></div>
          <div className="field"><label>Stipend / Salary</label><input className="input" value={form.stipend} onChange={set("stipend")} placeholder="e.g. ₹25,000/month or Unpaid" /></div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label>Paid Opportunity?</label>
            <select className="select" value={String(form.paid)} onChange={(e) => setForm((f) => ({ ...f, paid: e.target.value === "true" }))}>
              <option value="true">Paid</option>
              <option value="false">Unpaid</option>
            </select>
          </div>
          <div className="field"><label>Number of Openings</label><input className="input" type="number" min="1" value={form.openings} onChange={set("openings")} /></div>
        </div>

        <div className="form-grid">
          <div className="field"><label>Application Deadline</label><input className="input" type="date" value={form.deadline} onChange={set("deadline")} /></div>
          <div className="field"><label>Contact Email</label><input className="input" value={form.contactEmail} onChange={set("contactEmail")} /></div>
        </div>

        <div className="divider" />
        <div className="flex gap-12 wrap justify-between">
          <button className="btn btn-secondary" onClick={() => navigate("/company/listings")}>Cancel</button>
          <div className="flex gap-12">
            <button className="btn btn-secondary" onClick={handleSaveDraft} disabled={!form.title}>Save Draft</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={!isValid}>Submit for Approval</button>
          </div>
        </div>
      </div>
    </div>
  );
}
