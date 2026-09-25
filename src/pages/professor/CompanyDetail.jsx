import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function CompanyDetail() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const company = data.getCompany(companyId);

  if (!company) return <EmptyState icon="❓" title="Company not found" />;
  const listings = data.listingsForCompany(company.id);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Companies", to: "/professor/companies" }, { label: company.name }]} />

      <div className="card card-pad mb-24 flex items-center gap-16 wrap">
        <div className="company-logo" style={{ width: 58, height: 58, fontSize: 18 }}>{company.logoInitials}</div>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-8">
            <div className="font-bold text-lg">{company.name}</div>
            {company.verified && <Badge variant="success">Verified</Badge>}
          </div>
          <div className="text-muted text-sm">{company.industry} · {company.location} · {company.size}</div>
          <div className="text-muted text-sm">{company.website}</div>
        </div>
      </div>

      <div className="card card-pad mb-24">
        <div className="card-title mb-8">About</div>
        <p className="text-muted">{company.description}</p>
        <div className="divider" />
        <div className="text-sm"><span className="text-muted">HR Contact: </span>{company.hrContactName} · {company.hrEmail} · {company.hrPhone}</div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">Listings ({listings.length})</span></div>
        {listings.length === 0 ? (
          <div className="card-pad"><EmptyState icon="📋" title="No listings yet" /></div>
        ) : (
          <table className="table">
            <thead><tr><th>Title</th><th>Type</th><th>Applicants</th><th>Openings</th><th>Deadline</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="row-hover">
                  <td>{l.title}</td>
                  <td>{l.type}</td>
                  <td>{data.applicationsForListing(l.id).length}</td>
                  <td>{l.openings}</td>
                  <td className="text-muted">{formatDate(l.deadline)}</td>
                  <td><Badge status={l.status}>{l.status}</Badge></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/listings/${l.id}`)}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
