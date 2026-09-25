import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";

export default function Profile() {
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();
  const professor = data.getProfessor(user.id);
  const [editing, setEditing] = useState(false);
  const [designation, setDesignation] = useState(professor.designation);

  const myStudents = data.studentsForProfessor(professor.id);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Your faculty account details.</p>
        </div>
        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        ) : (
          <div className="flex gap-8">
            <button className="btn btn-secondary" onClick={() => { setDesignation(professor.designation); setEditing(false); }}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { showToast("Profile updated successfully.", "success"); setEditing(false); }}>Save Changes</button>
          </div>
        )}
      </div>

      <div className="card card-pad mb-24 flex items-center gap-16 wrap">
        <div className="avatar avatar-lg">{professor.photoInitials}</div>
        <div>
          <div className="font-bold text-lg">{professor.name}</div>
          <div className="text-muted text-sm">{professor.department} · {professor.designation}</div>
          <div className="text-muted text-sm">{professor.email}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-12">Account Details</div>
          <div className="field"><label>Full Name</label><input className="input" value={professor.name} disabled /></div>
          <div className="field"><label>College Email</label><input className="input" value={professor.email} disabled /></div>
          <div className="field"><label>Department</label><input className="input" value={professor.department} disabled /></div>
          <div className="field">
            <label>Designation</label>
            <input className="input" value={designation} onChange={(e) => setDesignation(e.target.value)} disabled={!editing} />
          </div>
        </div>
        <div className="card card-pad">
          <div className="card-title mb-12">Department Summary</div>
          <div className="text-sm flex-col gap-12">
            <div className="flex justify-between"><span className="text-muted">Students Managed</span><span className="font-semibold">{myStudents.length}</span></div>
            <div className="flex justify-between"><span className="text-muted">Departments Covered</span><span className="font-semibold">{professor.department}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
