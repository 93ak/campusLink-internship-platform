import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import EmptyState from "../../components/common/EmptyState";
import { formatDate, deadlineLabel } from "../../utils/helpers";

export default function OpportunityDetails() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();
  const [showApplyModal, setShowApplyModal] = useState(false);

  const listing = data.getListing(listingId);
  const student = data.getStudent(user.id);

  if (!listing) {
    return <EmptyState icon="❓" title="Opportunity not found" action={<button className="btn btn-secondary" onClick={() => navigate("/student/opportunities")}>Back to Opportunities</button>} />;
  }

  const company = data.getCompany(listing.companyId);
  const myApps = data.applicationsForStudent(user.id);
  const existingApp = myApps.find((a) => a.listingId === listing.id && a.status !== "Withdrawn");
  const saved = student.savedListingIds.includes(listing.id);

  const handleConfirmApply = async () => {
    const appId = await data.applyToListing(user.id, listing.id);
    setShowApplyModal(false);
    navigate(`/student/applications/${appId}`);
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Internship Opportunities", to: "/student/opportunities" }, { label: listing.title }]} />

      <div className="card card-pad mb-24">
        <div className="flex justify-between wrap" style={{ alignItems: "flex-start", gap: 16 }}>
          <div className="flex gap-16">
            <div className="company-logo" style={{ width: 58, height: 58, fontSize: 18 }}>{company.logoInitials}</div>
            <div>
              <h1 className="page-title">{listing.title}</h1>
              <div className="text-muted mt-4">{company.name} · {listing.location}</div>
              <div className="flex gap-8 wrap mt-12">
                <Badge variant={listing.type === "Internship" ? "info" : "neutral"}>{listing.type}</Badge>
                <Badge variant={listing.paid ? "success" : "neutral"}>{listing.paid ? "Paid" : "Unpaid"}</Badge>
                <Badge variant="neutral">{listing.workMode}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>Back</button>
            <button className="btn btn-secondary" onClick={() => data.toggleSaveListing(user.id, listing.id)}>{saved ? "★ Saved" : "☆ Save Opportunity"}</button>
            {existingApp ? (
              <button className="btn btn-ghost" onClick={() => navigate(`/student/applications/${existingApp.id}`)}>View Application</button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowApplyModal(true)}>Apply Now</button>
            )}
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Description</div>
            <p className="text-muted">{listing.description}</p>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Responsibilities</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "var(--color-text-muted)" }}>
              {listing.responsibilities.map((r, i) => <li key={i} className="mb-8">{r}</li>)}
            </ul>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Requirements</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "var(--color-text-muted)" }}>
              {listing.requirements.map((r, i) => <li key={i} className="mb-8">{r}</li>)}
            </ul>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Required Skills</div>
            <div className="flex gap-8 wrap">
              {listing.skills.map((s) => <span key={s} className="tag-chip">{s}</span>)}
            </div>
          </div>
        </div>

        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Key Details</div>
            <div className="flex-col gap-12 text-sm">
              <div className="flex justify-between"><span className="text-muted">Stipend/Salary</span><span className="font-semibold">{listing.stipend}</span></div>
              <div className="flex justify-between"><span className="text-muted">Duration</span><span className="font-semibold">{listing.duration}</span></div>
              <div className="flex justify-between"><span className="text-muted">Location</span><span className="font-semibold">{listing.location}</span></div>
              <div className="flex justify-between"><span className="text-muted">Work Mode</span><span className="font-semibold">{listing.workMode}</span></div>
              <div className="flex justify-between"><span className="text-muted">Openings</span><span className="font-semibold">{listing.openings - (listing.filledCount || 0)} of {listing.openings}</span></div>
              <div className="flex justify-between"><span className="text-muted">Deadline</span><span className="font-semibold">{formatDate(listing.deadline)}</span></div>
              <div className="divider" style={{ margin: "4px 0" }} />
              <div className="text-muted">{deadlineLabel(listing.deadline)}</div>
            </div>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Eligibility</div>
            <div className="text-sm text-muted mb-8">Departments</div>
            <div className="flex gap-8 wrap mb-12">{listing.eligibleDepartments.map((d) => <span key={d} className="tag-chip">{d}</span>)}</div>
            <div className="text-sm text-muted mb-8">Years</div>
            <div className="flex gap-8 wrap mb-12">{listing.eligibleYears.map((y) => <span key={y} className="tag-chip">{y}</span>)}</div>
            <div className="text-sm text-muted">Minimum CGPA: <strong>{listing.minCgpa}</strong></div>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">About {company.name}</div>
            <p className="text-muted text-sm">{company.description}</p>
            <div className="text-sm mt-12"><span className="text-muted">Industry:</span> {company.industry}</div>
          </div>
        </div>
      </div>

      {showApplyModal && (
        <Modal
          title="Confirm Your Application"
          onClose={() => setShowApplyModal(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmApply}>Confirm Application</button>
            </>
          }
        >
          <p className="text-muted mb-16">You're applying for <strong>{listing.title}</strong> at <strong>{company.name}</strong>. The following profile and resume will be submitted:</p>
          <div className="card card-pad" style={{ background: "var(--color-bg)" }}>
            <div className="flex items-center gap-12 mb-12">
              <div className="avatar">{student.photoInitials}</div>
              <div>
                <div className="font-semibold">{student.name}</div>
                <div className="text-muted text-sm">{student.registerNumber} · {student.department}</div>
              </div>
            </div>
            <div className="text-sm flex justify-between mb-8"><span className="text-muted">CGPA</span><span>{student.cgpa}</span></div>
            <div className="text-sm flex justify-between mb-8"><span className="text-muted">Year</span><span>{student.year}</span></div>
            <div className="text-sm flex justify-between">
              <span className="text-muted">Resume</span>
              <span>{student.resumeUploaded ? student.resumeName : "Not uploaded"}</span>
            </div>
          </div>
          {!student.resumeUploaded && (
            <p className="text-sm mt-12" style={{ color: "var(--color-danger)" }}>
              You haven't uploaded a resume yet. You can still apply, but consider uploading one from your Profile first.
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
