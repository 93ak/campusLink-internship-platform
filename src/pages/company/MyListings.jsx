import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Tabs from "../../components/common/Tabs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

const TABS = [
  { key: "All", label: "All" },
  { key: "Draft", label: "Draft" },
  { key: "Pending Approval", label: "Pending Approval" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
  { key: "Closed", label: "Closed / Filled" },
];

export default function MyListings() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("All");
  const [closeTarget, setCloseTarget] = useState(null);

  const myListings = data.listingsForCompany(user.companyId).slice().sort((a, b) => (a.createdDate < b.createdDate ? 1 : -1));
  const filtered = myListings.filter((l) => {
    if (tab === "All") return true;
    if (tab === "Closed") return ["Closed", "Filled"].includes(l.status);
    return l.status === tab;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Listings</h1>
          <p className="page-subtitle">All internship and job postings created by your company.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate("/company/listings/new")}>Create Listing</button>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="No listings here" message="Create your first listing to start receiving applications." action={<button className="btn btn-primary" onClick={() => navigate("/company/listings/new")}>Create Listing</button>} />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Created</th><th>Deadline</th><th>Applicants</th><th>Openings</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((l) => {
                const applicantCount = data.applicationsForListing(l.id).length;
                const canEdit = l.status === "Draft";
                const canClose = ["Approved", "Pending Approval"].includes(l.status);
                return (
                  <tr key={l.id} className="row-hover">
                    <td className="font-semibold">{l.title}</td>
                    <td>{l.type}</td>
                    <td className="text-muted">{formatDate(l.createdDate)}</td>
                    <td className="text-muted">{formatDate(l.deadline)}</td>
                    <td>{applicantCount}</td>
                    <td>{(l.filledCount || 0)}/{l.openings}</td>
                    <td><Badge status={l.status}>{l.status}</Badge></td>
                    <td>
                      <div className="flex gap-8 wrap">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/listings/${l.id}`)}>View</button>
                        {canEdit && <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/listings/${l.id}/edit`)}>Edit</button>}
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/listings/${l.id}/applicants`)}>Applicants</button>
                        {canClose && <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => setCloseTarget(l)}>Close</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {closeTarget && (
        <ConfirmDialog
          title="Close Listing?"
          message={`Closing '${closeTarget.title}' will remove it from the student marketplace and stop new applications. Existing applicants will remain visible.`}
          confirmLabel="Close Listing"
          danger
          onCancel={() => setCloseTarget(null)}
          onConfirm={() => { data.closeListing(closeTarget.id); setCloseTarget(null); }}
        />
      )}
    </div>
  );
}
