import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

const STEPS = ["Applied", "Shortlisted", "Interview Scheduled", "Selected"];

function TimelineStatus({ status }) {
  const isRejected = status === "Rejected";
  const isWithdrawn = status === "Withdrawn";
  const currentIndex = STEPS.indexOf(status);

  if (isWithdrawn) {
    return (
      <div className="timeline">
        <div className="timeline-step">
          <div className="timeline-marker-col"><div className="timeline-dot done">✓</div></div>
          <div className="timeline-content"><div className="t-title">Applied</div></div>
        </div>
        <div className="timeline-step">
          <div className="timeline-marker-col"><div className="timeline-dot failed">✕</div></div>
          <div className="timeline-content"><div className="t-title">Withdrawn by student</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline">
      {STEPS.map((step, idx) => {
        const done = isRejected ? idx < currentIndexForRejected(currentIndex) : idx < currentIndex;
        const current = !isRejected && idx === currentIndex;
        const rejectedHere = isRejected && idx === Math.max(currentIndex, 0);
        let dotClass = "pending";
        if (done) dotClass = "done";
        if (current) dotClass = "current";
        if (isRejected && idx === STEPS.length - 1) dotClass = "failed";
        return (
          <div className="timeline-step" key={step}>
            <div className="timeline-marker-col">
              <div className={`timeline-dot ${dotClass}`}>{done ? "✓" : idx + 1}</div>
              {idx < STEPS.length - 1 && <div className="timeline-line" />}
            </div>
            <div className="timeline-content">
              <div className="t-title">{isRejected && idx === STEPS.length - 1 ? "Rejected" : step}</div>
              {current && <div className="t-sub">Current stage</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
function currentIndexForRejected(idx) { return idx; }

export default function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();
  const [showWithdraw, setShowWithdraw] = useState(false);

  const app = data.getApplication(applicationId);
  if (!app) return <EmptyState icon="❓" title="Application not found" action={<button className="btn btn-secondary" onClick={() => navigate("/student/applications")}>Back to Applications</button>} />;

  const listing = data.getListing(app.listingId);
  const company = data.getCompany(listing.companyId);
  const interviews = data.interviewsForApplication(app.id);
  const canWithdraw = ["Applied", "Shortlisted"].includes(app.status);

  return (
    <div>
      <Breadcrumbs items={[{ label: "My Applications", to: "/student/applications" }, { label: listing.title }]} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{listing.title}</h1>
          <p className="page-subtitle">{company.name} · Applied {formatDate(app.appliedDate)}</p>
        </div>
        <div className="flex gap-8">
          <Badge status={app.status}>{app.status}</Badge>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1.4fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-16">Application Timeline</div>
          <TimelineStatus status={app.status} />
        </div>

        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Summary</div>
            <div className="flex-col gap-12 text-sm">
              <div className="flex justify-between"><span className="text-muted">Company</span><span className="font-semibold">{company.name}</span></div>
              <div className="flex justify-between"><span className="text-muted">Position</span><span className="font-semibold">{listing.title}</span></div>
              <div className="flex justify-between"><span className="text-muted">Applied Date</span><span>{formatDate(app.appliedDate)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Last Updated</span><span>{formatDate(app.lastUpdated)}</span></div>
              <div className="flex justify-between"><span className="text-muted">Deadline</span><span>{formatDate(listing.deadline)}</span></div>
            </div>
          </div>

          {interviews.length > 0 && (
            <div className="card card-pad">
              <div className="card-title mb-12">Interviews</div>
              {interviews.map((iv) => (
                <div key={iv.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <div className="font-semibold text-sm">{iv.round}</div>
                    <div className="text-muted text-sm">{formatDate(iv.date)} · {iv.time} · {iv.mode}</div>
                  </div>
                  <Badge status={iv.status}>{iv.status}</Badge>
                </div>
              ))}
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/student/interviews")}>View Interview Details</button>
            </div>
          )}

          <div className="card card-pad flex gap-12 wrap">
            <button className="btn btn-secondary" onClick={() => navigate(`/student/opportunities/${listing.id}`)}>View Opportunity</button>
            {app.status === "Selected" && <button className="btn btn-primary" onClick={() => navigate("/student/internship")}>View Internship</button>}
            {interviews.length > 0 && <button className="btn btn-secondary" onClick={() => navigate("/student/interviews")}>View Interview</button>}
            {canWithdraw && <button className="btn btn-danger" onClick={() => setShowWithdraw(true)}>Withdraw Application</button>}
          </div>
        </div>
      </div>

      {showWithdraw && (
        <ConfirmDialog
          title="Withdraw Application?"
          message={`Are you sure you want to withdraw your application for ${listing.title} at ${company.name}? This action cannot be undone.`}
          confirmLabel="Withdraw Application"
          danger
          onCancel={() => setShowWithdraw(false)}
          onConfirm={() => { data.withdrawApplication(app.id); setShowWithdraw(false); }}
        />
      )}
    </div>
  );
}
