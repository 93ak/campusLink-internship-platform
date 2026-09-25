import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Tabs from "../../components/common/Tabs";
import FileUploadButton from "../../components/common/FileUploadButton";
import { DEPARTMENTS } from "../../data/mockData";

const TABS = [
  { key: "basic", label: "Basic Info" },
  { key: "academic", label: "Academic" },
  { key: "skills", label: "Skills & Projects" },
  { key: "links", label: "Links & Resume" },
];

export default function Profile() {
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();
  const student = data.getStudent(user.id);

  const [tab, setTab] = useState("basic");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...student, skills: student.skills.join(", ") });

  const startEdit = () => {
    setForm({ ...student, skills: student.skills.join(", ") });
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveEdit = () => {
    data.updateStudentProfile(student.id, {
      phone: form.phone,
      department: form.department,
      year: form.year,
      cgpa: parseFloat(form.cgpa),
      skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
      github: form.github,
      linkedin: form.linkedin,
    });
    setEditing(false);
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Keep your details up to date so recruiters see the best version of you.</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={startEdit}>Edit Profile</button>
        ) : (
          <div className="flex gap-8">
            <button className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>
            <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
          </div>
        )}
      </div>

      <div className="card card-pad mb-24 flex items-center gap-16 wrap">
        <div className="avatar avatar-lg">{student.photoInitials}</div>
        <div style={{ flex: 1 }}>
          <div className="font-bold text-lg">{student.name}</div>
          <div className="text-muted text-sm">{student.registerNumber} · {student.department} · {student.year}</div>
          <div className="text-muted text-sm">{student.email}</div>
        </div>
        {editing && <button className="btn btn-secondary btn-sm" onClick={() => showToast("Photo updated.", "success")}>Change Photo</button>}
      </div>

      <div className="card card-pad">
        <Tabs tabs={TABS} active={tab} onChange={setTab} />

        {tab === "basic" && (
          <div className="form-grid">
            <div className="field"><label>Full Name</label><input className="input" value={student.name} disabled /></div>
            <div className="field"><label>Register Number</label><input className="input" value={student.registerNumber} disabled /></div>
            <div className="field"><label>College Email</label><input className="input" value={student.email} disabled /></div>
            <div className="field">
              <label>Phone</label>
              <input className="input" value={editing ? form.phone : student.phone} onChange={set("phone")} disabled={!editing} />
            </div>
          </div>
        )}

        {tab === "academic" && (
          <div className="form-grid">
            <div className="field">
              <label>Department</label>
              {editing ? (
                <select className="select" value={form.department} onChange={set("department")}>
                  {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              ) : (
                <input className="input" value={student.department} disabled />
              )}
            </div>
            <div className="field">
              <label>Year</label>
              {editing ? (
                <select className="select" value={form.year} onChange={set("year")}>
                  {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((y) => <option key={y}>{y}</option>)}
                </select>
              ) : (
                <input className="input" value={student.year} disabled />
              )}
            </div>
            <div className="field">
              <label>CGPA</label>
              <input className="input" type="number" step="0.1" min="0" max="10" value={editing ? form.cgpa : student.cgpa} onChange={set("cgpa")} disabled={!editing} />
            </div>
          </div>
        )}

        {tab === "skills" && (
          <div>
            <div className="field">
              <label>Skills</label>
              {editing ? (
                <input className="input" value={form.skills} onChange={set("skills")} />
              ) : (
                <div className="flex gap-8 wrap mt-4">{student.skills.map((s) => <span key={s} className="tag-chip">{s}</span>)}</div>
              )}
              <div className="hint">{editing && "Separate skills with commas."}</div>
            </div>
            <div className="field">
              <label>Projects</label>
              {student.projects.map((p, i) => (
                <div key={i} className="card card-pad mb-8" style={{ background: "var(--color-bg)" }}>
                  <div className="font-semibold text-sm">{p.title}</div>
                  <div className="text-muted text-sm">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "links" && (
          <div>
            <div className="form-grid">
              <div className="field">
                <label>GitHub</label>
                <input className="input" value={editing ? form.github : student.github} onChange={set("github")} disabled={!editing} />
              </div>
              <div className="field">
                <label>LinkedIn</label>
                <input className="input" value={editing ? form.linkedin : student.linkedin} onChange={set("linkedin")} disabled={!editing} />
              </div>
            </div>
            <div className="field">
              <label>Resume</label>
              <div className="file-row">
                <div>
                  <div className="font-semibold text-sm">{student.resumeUploaded ? student.resumeName : "No resume uploaded"}</div>
                  <div className="text-muted text-xs">PDF, DOC up to 5MB</div>
                </div>
                <div className="flex gap-8">
                  {student.resumeUploaded && <button className="btn btn-ghost btn-sm" onClick={() => showToast("Opening resume...", "info")}>View Resume</button>}
                  <FileUploadButton label="Upload Resume" onFile={(filename) => data.uploadResume(student.id, filename)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
