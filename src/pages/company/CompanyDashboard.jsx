import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function CompanyDashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();

  const myListings = data.listingsForCompany(user.companyId);
  const activeListings = myListings.filter((l) => l.status === "Approved");
  const listingIds = new Set(myListings.map((l) => l.id));
  const allApplicants = data.applications.filter((a) => listingIds.has(a.listingId));
  const shortlisted = allApplicants.filter((a) => a.status === "Shortlisted").length;
  const interviewsScheduled = data.interviews.filter((i) => listingIds.has(i.listingId) && i.status === "Scheduled");
  const selected = allApplicants.filter((a) => a.status === "Selected").length;

  const recentApplications = allApplicants.slice().sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user.name.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">{data.getCompany(user.companyId).name} · Recruitment overview</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/company/listings/new")}>Create Listing</button>
      </div>

      <div className="grid grid-stats mb-24">
        <StatCard label="Active Listings" value={activeListings.length} icon="📋" tone="info" />
        <StatCard label="Total Applicants" value={allApplicants.length} icon="🧑‍🎓" tone="info" />
        <StatCard label="Shortlisted" value={shortlisted} icon="⭐" tone="warning" />
        <StatCard label="Interviews Scheduled" value={interviewsScheduled.length} icon="🎤" tone="warning" />
        <StatCard label="Selected Candidates" value={selected} icon="🏆" tone="success" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Applications</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("/company/applicants")}>View all</button>
          </div>
          <div className="card-pad">
            {recentApplications.length === 0 ? <EmptyState icon="🧑‍🎓" title="No applicants yet" /> : recentApplications.map((a) => {
              const student = data.getStudent(a.studentId);
              const listing = data.getListing(a.listingId);
              return (
                <div key={a.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <div className="font-semibold text-sm">{student.name}</div>
                    <div className="text-muted text-xs">{listing.title}</div>
                  </div>
                  <Badge status={a.status}>{a.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Listing Status</span></div>
          <div className="card-pad">
            {myListings.length === 0 ? <EmptyState icon="📋" title="No listings yet" action={<button className="btn btn-primary btn-sm" onClick={() => navigate("/company/listings/new")}>Create Listing</button>} /> : myListings.slice(0, 5).map((l) => (
              <div key={l.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <div className="font-semibold text-sm">{l.title}</div>
                  <div className="text-muted text-xs">{l.openings - (l.filledCount || 0)} of {l.openings} openings left</div>
                </div>
                <Badge status={l.status}>{l.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header"><span className="card-title">Upcoming Interviews</span></div>
        <div className="card-pad">
          {interviewsScheduled.length === 0 ? <EmptyState icon="🎤" title="No interviews scheduled" /> : interviewsScheduled.slice(0, 4).map((iv) => {
            const student = data.getStudent(iv.studentId);
            const listing = data.getListing(iv.listingId);
            return (
              <div key={iv.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                <div>
                  <div className="font-semibold text-sm">{student.name} · {listing.title}</div>
                  <div className="text-muted text-xs">{iv.round} · {formatDate(iv.date)} at {iv.time}</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate("/company/interviews")}>View</button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header"><span className="card-title">Quick Actions</span></div>
        <div className="card-pad flex gap-12 wrap">
          <button className="btn btn-secondary" onClick={() => navigate("/company/listings")}>View Listings</button>
          <button className="btn btn-secondary" onClick={() => navigate("/company/applicants")}>View Applicants</button>
          <button className="btn btn-secondary" onClick={() => navigate("/company/interviews")}>Schedule Interview</button>
        </div>
      </div>
    </div>
  );
}
