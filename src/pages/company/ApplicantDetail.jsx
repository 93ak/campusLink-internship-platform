import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function ApplicantDetail() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();

  const [showReject, setShowReject] = useState(false);
  const [showSelect, setShowSelect] = useState(false);
  const [offer, setOffer] = useState({ startDate: "", endDate: "", stipend: "", supervisor: "" });

  const app = data.getApplication(applicationId);
  if (!app) return <EmptyState icon="❓" title="Application not found" />;

  const listing = data.getListing(app.listingId);
  if (listing.companyId !== user.companyId) return <EmptyState icon="🔒" title="You don't have access to this applicant" />;

  const student = data.getStudent(app.studentId);
  const interviews = data.interviewsForApplication(app.id);

  const openSelectModal = () => {
    setOffer({ startDate: "", endDate: "", stipend: listing.stipend, supervisor: "" });
    setShowSelect(true);
  };

  const confirmSelect = async () => {
    await data.selectCandidate(app.id, offer);
    setShowSelect(false);
    navigate("/company/selected");
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Applicants", to: "/company/applicants" }, { label: student.name }]} />

      <div className="page-header">
        <div className="flex gap-16">
          <div className="avatar avatar-lg">{student.photoInitials}</div>
          <div>
            <h1 className="page-title">{student.name}</h1>
            <p className="page-subtitle">{student.registerNumber} · {student.department} · {student.year} · Applied for {listing.title}</p>
          </div>
        </div>
        <Badge status={app.status}>{app.status}</Badge>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Profile</div>
            <div className="grid grid-3 text-sm mb-16">
              <div><div className="text-muted text-xs">CGPA</div><div className="font-semibold">{student.cgpa}</div></div>
              <div><div className="text-muted text-xs">Email</div><div className="font-semibold truncate">{student.email}</div></div>
              <div><div className="text-muted text-xs">Phone</div><div className="font-semibold">{student.phone}</div></div>
            </div>
            <div className="text-sm text-muted mb-8">Skills</div>
            <div className="flex gap-8 wrap mb-16">{student.skills.map((s) => <span key={s} className="tag-chip">{s}</span>)}</div>
            <div className="text-sm text-muted mb-8">Projects</div>
            {student.projects.map((p, i) => (
              <div key={i} className="card card-pad mb-8" style={{ background: "var(--color-bg)" }}>
                <div className="font-semibold text-sm">{p.title}</div>
                <div className="text-muted text-sm">{p.desc}</div>
              </div>
            ))}
            <div className="text-sm mt-12"><span className="text-muted">GitHub: </span>{student.github} &nbsp;·&nbsp; <span className="text-muted">LinkedIn: </span>{student.linkedin}</div>
          </div>

          <div className="card card-pad">
            <div className="flex justify-between items-center mb-12">
              <div className="card-title">Resume</div>
              {student.resumeUploaded && <button className="btn btn-secondary btn-sm" onClick={() => showToast(`Opening ${student.resumeName}...`, "info")}>View Resume</button>}
            </div>
            <p className="text-muted text-sm">{student.resumeUploaded ? student.resumeName : "This student has not uploaded a resume yet."}</p>
          </div>

          {interviews.length > 0 && (
            <div className="card card-pad">
              <div className="card-title mb-12">Interview History</div>
              {interviews.map((iv) => (
                <div key={iv.id} className="flex justify-between items-center mb-12" style={{ paddingBottom: 12, borderBottom: "1px solid var(--color-border)" }}>
                  <div>
                    <div className="font-semibold text-sm">{iv.round}</div>
                    <div className="text-muted text-sm">{formatDate(iv.date)} · {iv.time} · {iv.mode}</div>
                  </div>
                  <Badge status={iv.status}>{iv.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card card-pad flex-col gap-8">
          <div className="card-title mb-4">Recruiter Actions</div>
          {app.status === "Applied" && (
            <>
              <button className="btn btn-secondary btn-block" onClick={() => data.shortlistApplicant(app.id)}>Shortlist</button>
              <button className="btn btn-danger btn-block" onClick={() => setShowReject(true)}>Reject</button>
            </>
          )}
          {app.status === "Shortlisted" && (
            <>
              <button className="btn btn-primary btn-block" onClick={() => navigate(`/company/listings/${listing.id}/applicants`)}>Schedule Interview</button>
              <button className="btn btn-danger btn-block" onClick={() => setShowReject(true)}>Reject</button>
            </>
          )}
          {app.status === "Interview Scheduled" && (
            <>
              <button className="btn btn-success btn-block" onClick={openSelectModal}>Select Candidate</button>
              <button className="btn btn-danger btn-block" onClick={() => setShowReject(true)}>Reject</button>
              <button className="btn btn-secondary btn-block" onClick={() => navigate("/company/interviews")}>View Interview Details</button>
            </>
          )}
          {app.status === "Selected" && (
            <button className="btn btn-secondary btn-block" onClick={() => navigate("/company/selected")}>View in Selected Students</button>
          )}
          {app.status === "Rejected" && <p className="text-muted text-sm">This applicant has been rejected.</p>}
        </div>
      </div>

      {showReject && (
        <ConfirmDialog
          title="Reject Applicant?"
          message={`Are you sure you want to reject ${student.name}'s application? They will be notified of this decision.`}
          confirmLabel="Reject Applicant"
          danger
          onCancel={() => setShowReject(false)}
          onConfirm={() => { data.rejectApplicant(app.id); setShowReject(false); }}
        />
      )}

      {showSelect && (
        <Modal
          title="Confirm Candidate Selection"
          onClose={() => setShowSelect(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowSelect(false)}>Cancel</button>
              <button className="btn btn-success" disabled={!offer.startDate || !offer.endDate} onClick={confirmSelect}>Confirm Selection</button>
            </>
          }
        >
          <div className="card card-pad mb-16" style={{ background: "var(--color-bg)" }}>
            <div className="flex justify-between text-sm mb-8"><span className="text-muted">Student</span><span className="font-semibold">{student.name}</span></div>
            <div className="flex justify-between text-sm mb-8"><span className="text-muted">Position</span><span className="font-semibold">{listing.title}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted">Company</span><span className="font-semibold">{data.getCompany(listing.companyId).name}</span></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Start Date</label><input className="input" type="date" value={offer.startDate} onChange={(e) => setOffer((o) => ({ ...o, startDate: e.target.value }))} /></div>
            <div className="field"><label>End Date</label><input className="input" type="date" value={offer.endDate} onChange={(e) => setOffer((o) => ({ ...o, endDate: e.target.value }))} /></div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Stipend / Salary</label><input className="input" value={offer.stipend} onChange={(e) => setOffer((o) => ({ ...o, stipend: e.target.value }))} /></div>
            <div className="field"><label>Supervisor</label><input className="input" value={offer.supervisor} onChange={(e) => setOffer((o) => ({ ...o, supervisor: e.target.value }))} placeholder="Name, designation" /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
