import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function ListingApprovalDetails() {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const listing = data.getListing(listingId);
  const [modal, setModal] = useState(null); // "reject" | "changes" | null
  const [reason, setReason] = useState("");

  if (!listing) return <EmptyState icon="❓" title="Listing not found" />;
  const company = data.getCompany(listing.companyId);
  const isPending = listing.status === "Pending Approval";

  const handleApprove = async () => {
    await data.approveListing(listing.id);
    navigate("/professor/listings");
  };

  const submitModal = async () => {
    if (modal === "reject") await data.rejectListing(listing.id, reason);
    if (modal === "changes") await data.requestListingChanges(listing.id, reason);
    setModal(null);
    setReason("");
    navigate("/professor/listings");
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Internship Listings", to: "/professor/listings" }, { label: listing.title }]} />

      <div className="page-header">
        <div className="flex gap-16">
          <div className="company-logo" style={{ width: 54, height: 54 }}>{company.logoInitials}</div>
          <div>
            <h1 className="page-title">{listing.title}</h1>
            <p className="page-subtitle">{company.name} · Submitted {formatDate(listing.createdDate)}</p>
          </div>
        </div>
        <Badge status={listing.status}>{listing.status}</Badge>
      </div>

      {listing.status === "Rejected" && listing.rejectionReason && (
        <div className="card card-pad mb-16" style={{ background: "var(--color-danger-bg)" }}>
          <div className="font-semibold text-sm" style={{ color: "var(--color-danger)" }}>Rejection reason</div>
          <p className="text-sm" style={{ color: "var(--color-danger)" }}>{listing.rejectionReason}</p>
        </div>
      )}

      <div className="grid" style={{ gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Description</div>
            <p className="text-muted">{listing.description}</p>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Eligibility</div>
            <div className="text-sm mb-8"><span className="text-muted">Departments: </span>{listing.eligibleDepartments.join(", ")}</div>
            <div className="text-sm mb-8"><span className="text-muted">Years: </span>{listing.eligibleYears.join(", ")}</div>
            <div className="text-sm"><span className="text-muted">Minimum CGPA: </span>{listing.minCgpa}</div>
          </div>
          <div className="card card-pad">
            <div className="card-title mb-12">Required Skills</div>
            <div className="flex gap-8 wrap">{listing.skills.map((s) => <span key={s} className="tag-chip">{s}</span>)}</div>
          </div>
        </div>

        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="card-title mb-12">Key Details</div>
            <div className="flex-col gap-12 text-sm">
              <div className="flex justify-between"><span className="text-muted">Salary/Stipend</span><span className="font-semibold">{listing.stipend}</span></div>
              <div className="flex justify-between"><span className="text-muted">Duration</span><span className="font-semibold">{listing.duration}</span></div>
              <div className="flex justify-between"><span className="text-muted">Location</span><span className="font-semibold">{listing.location}</span></div>
              <div className="flex justify-between"><span className="text-muted">Openings</span><span className="font-semibold">{listing.openings}</span></div>
              <div className="flex justify-between"><span className="text-muted">Deadline</span><span className="font-semibold">{formatDate(listing.deadline)}</span></div>
            </div>
          </div>

          {isPending && (
            <div className="card card-pad flex-col gap-8">
              <button className="btn btn-success btn-block" onClick={handleApprove}>Approve Listing</button>
              <button className="btn btn-secondary btn-block" onClick={() => setModal("changes")}>Request Changes</button>
              <button className="btn btn-danger btn-block" onClick={() => setModal("reject")}>Reject Listing</button>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <Modal
          title={modal === "reject" ? "Reject Listing" : "Request Changes"}
          onClose={() => setModal(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className={`btn ${modal === "reject" ? "btn-danger" : "btn-primary"}`} disabled={!reason.trim()} onClick={submitModal}>
                {modal === "reject" ? "Confirm Rejection" : "Send Feedback"}
              </button>
            </>
          }
        >
          <div className="field">
            <label>{modal === "reject" ? "Reason for rejection (required)" : "Feedback for the company (required)"}</label>
            <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={modal === "reject" ? "Explain why this listing doesn't meet college guidelines..." : "Describe what needs to change before this can be approved..."} />
          </div>
        </Modal>
      )}
    </div>
  );
}
