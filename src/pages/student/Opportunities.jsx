import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { deadlineLabel, formatDate } from "../../utils/helpers";
import { DEPARTMENTS } from "../../data/mockData";

export default function Opportunities() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [department, setDepartment] = useState("All");
  const [type, setType] = useState("All");
  const [workMode, setWorkMode] = useState("All");
  const [paidOnly, setPaidOnly] = useState("All");

  const student = data.getStudent(user.id);
  const myApps = data.applicationsForStudent(user.id);
  const appliedListingIds = new Set(myApps.filter((a) => a.status !== "Withdrawn").map((a) => a.listingId));

  const approvedListings = data.listings.filter((l) => l.status === "Approved");

  const filtered = useMemo(() => {
    return approvedListings.filter((l) => {
      const company = data.getCompany(l.companyId);
      const q = search.trim().toLowerCase();
      const matchesSearch = !q || l.title.toLowerCase().includes(q) || company.name.toLowerCase().includes(q) || l.skills.some((s) => s.toLowerCase().includes(q));
      const matchesDept = department === "All" || l.eligibleDepartments.includes(department);
      const matchesType = type === "All" || l.type === type;
      const matchesMode = workMode === "All" || l.workMode === workMode;
      const matchesPaid = paidOnly === "All" || (paidOnly === "Paid" ? l.paid : !l.paid);
      return matchesSearch && matchesDept && matchesType && matchesMode && matchesPaid;
    });
  }, [approvedListings, search, department, type, workMode, paidOnly, data]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Opportunities</h1>
          <p className="page-subtitle">{filtered.length} opportunities matching your filters</p>
        </div>
      </div>

      <div className="card card-pad mb-24">
        <div className="field" style={{ marginBottom: 12 }}>
          <input className="input" placeholder="Search by title, company, or skill..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="form-grid">
          <div className="field">
            <label>Department</label>
            <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)}>
              <option>All</option>
              {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Type</label>
            <select className="select" value={type} onChange={(e) => setType(e.target.value)}>
              <option>All</option>
              <option>Internship</option>
              <option>Job</option>
            </select>
          </div>
          <div className="field">
            <label>Work Mode</label>
            <select className="select" value={workMode} onChange={(e) => setWorkMode(e.target.value)}>
              <option>All</option>
              <option>Remote</option>
              <option>On-site</option>
              <option>Hybrid</option>
            </select>
          </div>
          <div className="field">
            <label>Compensation</label>
            <select className="select" value={paidOnly} onChange={(e) => setPaidOnly(e.target.value)}>
              <option>All</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No opportunities found" message="Try adjusting your filters or search terms." />
      ) : (
        <div className="grid grid-2">
          {filtered.map((l) => {
            const company = data.getCompany(l.companyId);
            const already = appliedListingIds.has(l.id);
            const saved = student.savedListingIds.includes(l.id);
            return (
              <div key={l.id} className="card card-pad">
                <div className="flex justify-between" style={{ alignItems: "flex-start" }}>
                  <div className="flex gap-12">
                    <div className="company-logo">{company.logoInitials}</div>
                    <div>
                      <div className="font-bold">{l.title}</div>
                      <div className="text-muted text-sm">{company.name}</div>
                    </div>
                  </div>
                  <Badge variant={l.type === "Internship" ? "info" : "neutral"}>{l.type}</Badge>
                </div>

                <div className="flex gap-8 wrap mt-12">
                  <span className="tag-chip">📍 {l.location}</span>
                  <span className="tag-chip">🖥 {l.workMode}</span>
                  <span className="tag-chip">⏱ {l.duration}</span>
                  <span className="tag-chip">💰 {l.stipend}</span>
                </div>

                <div className="flex gap-8 wrap mt-12">
                  {l.skills.slice(0, 4).map((s) => <span key={s} className="tag-chip">{s}</span>)}
                </div>

                <div className="flex justify-between items-center mt-16">
                  <div className="text-sm">
                    <span className="text-muted">{l.openings} opening{l.openings > 1 ? "s" : ""} · </span>
                    <span className={deadlineLabel(l.deadline) === "Deadline passed" ? "text-danger" : "text-muted"} style={{ color: deadlineLabel(l.deadline).includes("today") || deadlineLabel(l.deadline) === "Deadline passed" ? "var(--color-danger)" : undefined }}>
                      {deadlineLabel(l.deadline)}
                    </span>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn-icon" title={saved ? "Unsave" : "Save opportunity"} onClick={() => data.toggleSaveListing(user.id, l.id)}>{saved ? "★" : "☆"}</button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/student/opportunities/${l.id}`)}>View Details</button>
                    {already ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/student/applications/${myApps.find((a) => a.listingId === l.id).id}`)}>View Application</button>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => navigate(`/student/opportunities/${l.id}`)}>Apply</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
