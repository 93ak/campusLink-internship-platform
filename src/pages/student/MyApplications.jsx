import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import Tabs from "../../components/common/Tabs";
import { formatDate } from "../../utils/helpers";

const TABS = [
  { key: "All", label: "All" },
  { key: "Active", label: "Active" },
  { key: "Selected", label: "Selected" },
  { key: "Rejected", label: "Rejected" },
  { key: "Withdrawn", label: "Withdrawn" },
];

export default function MyApplications() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");

  const apps = data.applicationsForStudent(user.id).slice().sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1));

  const filtered = apps.filter((a) => {
    if (tab === "All") return true;
    if (tab === "Active") return ["Applied", "Shortlisted", "Interview Scheduled"].includes(a.status);
    return a.status === tab;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Applications</h1>
          <p className="page-subtitle">Track the status of every internship and job you've applied to.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/student/opportunities")}>Browse Internships</button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="📄" title="No applications here" message="Applications you submit will show up in this list." action={<button className="btn btn-primary" onClick={() => navigate("/student/opportunities")}>Browse Internships</button>} />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Applied</th>
                <th>Deadline</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const listing = data.getListing(a.listingId);
                const company = data.getCompany(listing.companyId);
                return (
                  <tr key={a.id} className="row-hover" style={{ cursor: "pointer" }} onClick={() => navigate(`/student/applications/${a.id}`)}>
                    <td>
                      <div className="flex items-center gap-12">
                        <div className="company-logo" style={{ width: 34, height: 34, fontSize: 12 }}>{company.logoInitials}</div>
                        {company.name}
                      </div>
                    </td>
                    <td>{listing.title}</td>
                    <td className="text-muted">{formatDate(a.appliedDate)}</td>
                    <td className="text-muted">{formatDate(listing.deadline)}</td>
                    <td><Badge status={a.status}>{a.status}</Badge></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/student/applications/${a.id}`); }}>View →</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
