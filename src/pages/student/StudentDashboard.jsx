import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import StatCard from "../../components/common/StatCard";
import ProgressBar from "../../components/common/ProgressBar";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate, timeAgo } from "../../utils/helpers";

function computeProfileCompletion(student) {
  const fields = [student.phone, student.department, student.year, student.cgpa, student.skills?.length, student.projects?.length, student.github, student.linkedin, student.resumeUploaded];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const student = data.getStudent(user.id);
  const myApps = data.applicationsForStudent(user.id);
  const completion = computeProfileCompletion(student);

  const shortlisted = myApps.filter((a) => ["Shortlisted", "Interview Scheduled"].includes(a.status)).length;
  const upcomingInterviews = data.interviews.filter((i) => myApps.some((a) => a.id === i.applicationId) && i.status === "Scheduled");
  const myInternship = data.internships.find((i) => i.studentId === user.id);
  const notifs = data.studentNotifications.filter((n) => n.studentId === user.id).slice(0, 4);
  const recommended = data.listings.filter((l) => l.status === "Approved" && l.eligibleDepartments.includes(student.department) && !myApps.some((a) => a.listingId === l.id)).slice(0, 3);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {student.name.split(" ")[0]} 👋</h1>
          <p className="page-subtitle">Here's what's happening with your internship journey.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/student/opportunities")}>Browse Internships</button>
      </div>

      <div className="card card-pad mb-24">
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="font-semibold">Profile Completion</div>
            <div className="text-muted text-sm">A complete profile helps recruiters shortlist you faster.</div>
          </div>
          <div className="font-bold text-lg">{completion}%</div>
        </div>
        <ProgressBar percent={completion} />
        {completion < 100 && (
          <div className="mt-12">
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/student/profile")}>Complete Profile</button>
          </div>
        )}
      </div>

      <div className="grid grid-stats mb-24">
        <StatCard label="Applications" value={myApps.length} sub="Total submitted" icon="📄" tone="info" />
        <StatCard label="Shortlisted" value={shortlisted} sub="Awaiting next step" icon="⭐" tone="warning" />
        <StatCard label="Upcoming Interviews" value={upcomingInterviews.length} sub="Scheduled" icon="🎤" tone="info" />
        <StatCard label="Internship Status" value={myInternship ? myInternship.status : "None yet"} sub={myInternship ? myInternship.position : "Apply to get started"} icon="💼" tone={myInternship ? "success" : "neutral"} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Notifications</span>
            <Link to="/student/notifications" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>View all</Link>
          </div>
          <div className="card-pad">
            {notifs.length === 0 ? (
              <EmptyState icon="🔕" title="No notifications yet" />
            ) : (
              notifs.map((n) => (
                <div key={n.id} className="flex gap-12 mb-16" style={{ alignItems: "flex-start" }}>
                  <div style={{ fontSize: 18 }}>{!n.read ? "🔵" : "⚪"}</div>
                  <div>
                    <div className="font-semibold text-sm">{n.title}</div>
                    <div className="text-muted text-sm">{n.message}</div>
                    <div className="text-faint text-xs mt-4">{timeAgo(n.date)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recommended For You</span>
            <Link to="/student/opportunities" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Browse all</Link>
          </div>
          <div className="card-pad">
            {recommended.length === 0 ? (
              <EmptyState icon="🧭" title="No new matches right now" message="Check back soon or browse all listings." />
            ) : (
              recommended.map((l) => {
                const company = data.getCompany(l.companyId);
                return (
                  <div key={l.id} className="flex justify-between items-center mb-16" style={{ paddingBottom: 14, borderBottom: "1px solid var(--color-border)" }}>
                    <div className="flex items-center gap-12">
                      <div className="company-logo">{company.logoInitials}</div>
                      <div>
                        <div className="font-semibold text-sm">{l.title}</div>
                        <div className="text-muted text-xs">{company.name} · {l.location}</div>
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/student/opportunities/${l.id}`)}>View</button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card mt-24">
        <div className="card-header"><span className="card-title">Quick Actions</span></div>
        <div className="card-pad flex gap-12 wrap">
          <button className="btn btn-secondary" onClick={() => navigate("/student/applications")}>View Applications</button>
          <button className="btn btn-secondary" onClick={() => navigate("/student/profile")}>Complete Profile</button>
          <button className="btn btn-secondary" onClick={() => navigate("/student/interviews")}>
            {upcomingInterviews.length ? "View Interview" : "Interviews"}
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/student/internship")}>View Internship</button>
        </div>
      </div>
    </div>
  );
}
