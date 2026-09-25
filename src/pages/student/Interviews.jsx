import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function Interviews() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const myInterviews = data.interviews
    .filter((i) => i.studentId === user.id)
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const upcoming = myInterviews.filter((i) => i.status === "Scheduled");
  const past = myInterviews.filter((i) => i.status !== "Scheduled");

  const InterviewCard = ({ iv }) => {
    const listing = data.getListing(iv.listingId);
    const company = data.getCompany(listing.companyId);
    return (
      <div className="card card-pad mb-16">
        <div className="flex justify-between wrap" style={{ alignItems: "flex-start" }}>
          <div className="flex gap-12">
            <div className="company-logo">{company.logoInitials}</div>
            <div>
              <div className="font-bold">{iv.round}</div>
              <div className="text-muted text-sm">{listing.title} · {company.name}</div>
            </div>
          </div>
          <Badge status={iv.status}>{iv.status}</Badge>
        </div>
        <div className="grid grid-3 mt-16 text-sm">
          <div><span className="text-muted">Date</span><div className="font-semibold">{formatDate(iv.date)}</div></div>
          <div><span className="text-muted">Time</span><div className="font-semibold">{iv.time}</div></div>
          <div><span className="text-muted">Mode</span><div className="font-semibold">{iv.mode}</div></div>
        </div>
        <div className="mt-12 text-sm">
          <span className="text-muted">{iv.mode === "Online" ? "Meeting Link" : "Location"}</span>
          <div className="font-semibold">{iv.locationOrLink}</div>
        </div>
        {iv.instructions && (
          <div className="mt-12 text-sm" style={{ background: "var(--color-bg)", padding: 12, borderRadius: 8 }}>
            <span className="text-muted">Instructions: </span>{iv.instructions}
          </div>
        )}
        <div className="flex gap-8 wrap mt-16">
          {iv.status === "Scheduled" && iv.mode === "Online" && (
            <button className="btn btn-primary btn-sm" onClick={() => showToast("Joining interview room...", "info")}>Join Interview</button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => showToast("Added to your calendar.", "success")}>Add to Calendar</button>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/student/applications/${iv.applicationId}`)}>View Application</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interviews</h1>
          <p className="page-subtitle">Keep track of upcoming and past interview rounds.</p>
        </div>
      </div>

      <div className="mb-8 font-semibold">Upcoming ({upcoming.length})</div>
      {upcoming.length === 0 ? (
        <EmptyState icon="🎤" title="No upcoming interviews" message="Scheduled interviews will appear here." />
      ) : (
        upcoming.map((iv) => <InterviewCard iv={iv} key={iv.id} />)
      )}

      <div className="mb-8 mt-24 font-semibold">Previous ({past.length})</div>
      {past.length === 0 ? (
        <EmptyState icon="🗂" title="No past interviews yet" />
      ) : (
        past.map((iv) => <InterviewCard iv={iv} key={iv.id} />)
      )}
    </div>
  );
}
