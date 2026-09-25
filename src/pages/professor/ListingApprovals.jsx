import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Tabs from "../../components/common/Tabs";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

const TABS = [
  { key: "Pending Approval", label: "Pending Approval" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
  { key: "Closed", label: "Closed / Filled" },
];

export default function ListingApprovals() {
  const data = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Pending Approval");

  const filtered = data.listings.filter((l) => (tab === "Closed" ? ["Closed", "Filled"].includes(l.status) : l.status === tab));
  const counts = { "Pending Approval": data.listings.filter((l) => l.status === "Pending Approval").length };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Listing Approval</h1>
          <p className="page-subtitle">Review and approve internship/job listings submitted by companies.</p>
        </div>
      </div>

      <Tabs tabs={TABS.map((t) => (t.key === "Pending Approval" && counts[t.key] ? { ...t, label: `${t.label} (${counts[t.key]})` } : t))} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="📋" title="Nothing here" message="No listings in this category." />
      ) : (
        <div className="grid grid-2">
          {filtered.map((l) => {
            const company = data.getCompany(l.companyId);
            return (
              <div key={l.id} className="card card-pad card-clickable" onClick={() => navigate(`/professor/listings/${l.id}`)}>
                <div className="flex justify-between" style={{ alignItems: "flex-start" }}>
                  <div className="flex gap-12">
                    <div className="company-logo">{company.logoInitials}</div>
                    <div>
                      <div className="font-bold">{l.title}</div>
                      <div className="text-muted text-sm">{company.name}</div>
                    </div>
                  </div>
                  <Badge status={l.status}>{l.status}</Badge>
                </div>
                <div className="flex gap-8 wrap mt-12">
                  <span className="tag-chip">{l.type}</span>
                  <span className="tag-chip">{l.location}</span>
                  <span className="tag-chip">{l.duration}</span>
                  <span className="tag-chip">{l.openings} openings</span>
                </div>
                <div className="text-muted text-sm mt-12">Deadline: {formatDate(l.deadline)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
