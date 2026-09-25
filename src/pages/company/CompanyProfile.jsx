import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";

export default function CompanyProfile() {
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();
  const company = data.getCompany(user.companyId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...company });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const startEdit = () => { setForm({ ...company }); setEditing(true); };
  const cancelEdit = () => setEditing(false);
  const saveEdit = () => { data.updateCompanyProfile(company.id, form); setEditing(false); };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Profile</h1>
          <p className="page-subtitle">This information is shown to students on every listing you publish.</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={startEdit}>Edit</button>
        ) : (
          <div className="flex gap-8">
            <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save</button>
          </div>
        )}
      </div>

      <div className="card card-pad mb-24 flex items-center gap-16 wrap">
        <div className="company-logo" style={{ width: 64, height: 64, fontSize: 22 }}>{company.logoInitials}</div>
        <div style={{ flex: 1 }}>
          <div className="font-bold text-lg">{company.name}</div>
          <div className="text-muted text-sm">{company.industry} · {company.location}</div>
        </div>
        {editing && <button className="btn btn-secondary btn-sm" onClick={() => showToast("Logo updated.", "success")}>Change Logo</button>}
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-12">Company Details</div>
          <div className="field"><label>Company Name</label><input className="input" value={editing ? form.name : company.name} onChange={set("name")} disabled={!editing} /></div>
          <div className="field"><label>Website</label><input className="input" value={editing ? form.website : company.website} onChange={set("website")} disabled={!editing} /></div>
          <div className="field"><label>Industry</label><input className="input" value={editing ? form.industry : company.industry} onChange={set("industry")} disabled={!editing} /></div>
          <div className="field"><label>Location</label><input className="input" value={editing ? form.location : company.location} onChange={set("location")} disabled={!editing} /></div>
          <div className="field"><label>Company Size</label><input className="input" value={editing ? form.size : company.size} onChange={set("size")} disabled={!editing} /></div>
          <div className="field"><label>Description</label><textarea className="textarea" value={editing ? form.description : company.description} onChange={set("description")} disabled={!editing} /></div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-12">HR Contact</div>
          <div className="field"><label>Contact Name</label><input className="input" value={editing ? form.hrContactName : company.hrContactName} onChange={set("hrContactName")} disabled={!editing} /></div>
          <div className="field"><label>Contact Email</label><input className="input" value={editing ? form.hrEmail : company.hrEmail} onChange={set("hrEmail")} disabled={!editing} /></div>
          <div className="field"><label>Contact Phone</label><input className="input" value={editing ? form.hrPhone : company.hrPhone} onChange={set("hrPhone")} disabled={!editing} /></div>

          <div className="divider" />
          <div className="card-title mb-12">Verification Status</div>
          <p className="text-muted text-sm">Your company is <strong style={{ color: "var(--color-success)" }}>verified</strong> by the college internship cell. Verified companies can post listings for professor review.</p>
        </div>
      </div>
    </div>
  );
}
