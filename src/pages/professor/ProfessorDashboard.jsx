import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import StatCard from "../../components/common/StatCard";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function ProfessorDashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();

  const myStudents = data.studentsForProfessor(user.id);
  const studentIds = new Set(myStudents.map((s) => s.id));
  const withInternship = data.internships.filter((i) => studentIds.has(i.studentId));
  const withoutInternship = myStudents.length - new Set(withInternship.map((i) => i.studentId)).size;

  const activeListings = data.listings.filter((l) => l.status === "Approved");
  const pendingListings = data.listings.filter((l) => l.status === "Pending Approval");
  const pendingVerifications = data.internships.filter((i) => i.verificationStatus === "Pending Verification");
  const selectedStudents = data.applications.filter((a) => studentIds.has(a.studentId) && a.status === "Selected");
  const ongoingInternships = withInternship.filter((i) => i.status === "Ongoing" || i.status === "Upcoming");

  const recentApplications = data.applications
    .filter((a) => studentIds.has(a.studentId))
    .slice().sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user.name.split(" ")[1] || user.name} 👋</h1>
          <p className="page-subtitle">Department overview and pending actions.</p>
        </div>
      </div>

      <div className="grid grid-stats mb-24">
        <StatCard label="Total Students" value={myStudents.length} icon="🎓" tone="info" />
        <StatCard label="With Internships" value={new Set(withInternship.map((i) => i.studentId)).size} icon="💼" tone="success" />
        <StatCard label="Without Internships" value={withoutInternship} icon="🕒" tone="neutral" />
        <StatCard label="Active Listings" value={activeListings.length} icon="📋" tone="info" />
        <StatCard label="Pending Approvals" value={pendingListings.length} icon="⏳" tone="warning" />
        <StatCard label="Pending Verifications" value={pendingVerifications.length} icon="✅" tone="warning" />
        <StatCard label="Selected Students" value={selectedStudents.length} icon="🏆" tone="success" />
        <StatCard label="Ongoing Internships" value={ongoingInternships.length} icon="📈" tone="info" />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header"><span className="card-title">Recent Applications</span></div>
          <div className="card-pad">
            {recentApplications.length === 0 ? <EmptyState icon="📄" title="No applications yet" /> : recentApplications.map((a) => {
              const s = data.getStudent(a.studentId);
              const l = data.getListing(a.listingId);
              return (
                <div key={a.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-muted text-xs">{l.title}</div>
                  </div>
                  <Badge status={a.status}>{a.status}</Badge>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Pending Actions</span></div>
          <div className="card-pad">
            <div className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
              <div>
                <div className="font-semibold text-sm">{pendingListings.length} listing{pendingListings.length !== 1 ? "s" : ""} awaiting approval</div>
                <div className="text-muted text-xs">Review new roles submitted by companies</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/professor/listings")}>Review</button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold text-sm">{pendingVerifications.length} internship{pendingVerifications.length !== 1 ? "s" : ""} to verify</div>
                <div className="text-muted text-xs">Confirm student internship documents</div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/professor/verification")}>Verify</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header"><span className="card-title">Quick Actions</span></div>
        <div className="card-pad flex gap-12 wrap">
          <button className="btn btn-secondary" onClick={() => navigate("/professor/students")}>View Students</button>
          <button className="btn btn-secondary" onClick={() => navigate("/professor/listings")}>Review Listings</button>
          <button className="btn btn-secondary" onClick={() => navigate("/professor/applications")}>Review Applications</button>
          <button className="btn btn-secondary" onClick={() => navigate("/professor/verification")}>Verify Internships</button>
          <button className="btn btn-secondary" onClick={() => navigate("/professor/reports")}>View Reports</button>
        </div>
      </div>
    </div>
  );
}
