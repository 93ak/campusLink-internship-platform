import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function ListingDetail() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();
  const [showClose, setShowClose] = useState(false);

  const listing = data.getListing(listingId);
  if (!listing) return <EmptyState icon="❓" title="Listing not found" />;
  if (listing.companyId !== user.companyId) return <EmptyState icon="🔒" title="You don't have access to this listing" />;

  const applicantCount = data.applicationsForListing(listing.id).length;
  const canEdit = listing.status === "Draft";
  const canClose = ["Approved", "Pending Approval"].includes(listing.status);

  return (
    <div>
      <Breadcrumbs items={[{ label: "My Listings", to: "/company/listings" }, { label: listing.title }]} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{listing.title}</h1>
          <p className="page-subtitle">Created {formatDate(listing.createdDate)} · {applicantCount} applicant{applicantCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-8">
          <Badge status={listing.status}>{listing.status}</Badge>
        </div>
      </div>

      {listing.status === "Rejected" && listing.rejectionReason && (
        <div className="card card-pad mb-16" style={{ background: "var(--color-danger-bg)" }}>
          <div className="font-semibold text-sm" style={{ color: "var(--color-danger)" }}>Rejected by professor</div>
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>{listing.rejectionReason}</p>
        </div>
      )}
      {listing.status === "Draft" && listing.changeFeedback && (
        <div className="card card-pad mb-16" style={{ background: "var(--color-warning-bg)" }}>
          <div className="font-semibold text-sm" style={{ color: "var(--color-warning)" }}>Professor requested changes</div>
          <p className="text-sm" style={{ color: "var(--color-warning)" }}>{listing.changeFeedback}</p>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Description</div>
            <p className="text-muted">{listing.description}</p>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Responsibilities</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "var(--color-text-muted)" }}>{listing.responsibilities.map((r, i) => <li key={i} className="mb-8">{r}</li>)}</ul>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Requirements</div>
            <ul style={{ paddingLeft: 18, margin: 0, color: "var(--color-text-muted)" }}>{listing.requirements.map((r, i) => <li key={i} className="mb-8">{r}</li>)}</ul>
          </div>
        </div>

        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Key Details</div>
            <div className="flex-col gap-12 text-sm">
              <div className="flex justify-between"><span className="text-muted">Type</span><span className="font-semibold">{listing.type}</span></div>
              <div className="flex justify-between"><span className="text-muted">Stipend/Salary</span><span className="font-semibold">{listing.stipend}</span></div>
              <div className="flex justify-between"><span className="text-muted">Duration</span><span className="font-semibold">{listing.duration}</span></div>
              <div className="flex justify-between"><span className="text-muted">Location</span><span className="font-semibold">{listing.location}</span></div>
              <div className="flex justify-between"><span className="text-muted">Openings</span><span className="font-semibold">{(listing.filledCount || 0)}/{listing.openings} filled</span></div>
              <div className="flex justify-between"><span className="text-muted">Deadline</span><span className="font-semibold">{formatDate(listing.deadline)}</span></div>
            </div>
          </div>

          <div className="card card-pad flex-col gap-8">
            <button className="btn btn-primary btn-block" onClick={() => navigate(`/company/listings/${listing.id}/applicants`)}>View Applicants ({applicantCount})</button>
            {canEdit && <button className="btn btn-secondary btn-block" onClick={() => navigate(`/company/listings/${listing.id}/edit`)}>Edit Listing</button>}
            {canClose && <button className="btn btn-danger btn-block" onClick={() => setShowClose(true)}>Close Listing</button>}
          </div>
        </div>
      </div>

      {showClose && (
        <ConfirmDialog
          title="Close Listing?"
          message={`Closing '${listing.title}' will remove it from the student marketplace and stop new applications.`}
          confirmLabel="Close Listing"
          danger
          onCancel={() => setShowClose(false)}
          onConfirm={() => { data.closeListing(listing.id); setShowClose(false); }}
        />
      )}
    </div>
  );
}
