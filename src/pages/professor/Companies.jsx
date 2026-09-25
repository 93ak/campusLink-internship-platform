import { useNavigate } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";

export default function Companies() {
  const data = useData();
  const navigate = useNavigate();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Registered Companies</h1>
          <p className="page-subtitle">{data.companies.length} companies partnered with the college</p>
        </div>
      </div>

      <div className="grid grid-2">
        {data.companies.map((c) => {
          const listings = data.listingsForCompany(c.id);
          const applicantCount = listings.reduce((sum, l) => sum + data.applicationsForListing(l.id).length, 0);
          const selected = listings.reduce((sum, l) => sum + data.applicationsForListing(l.id).filter((a) => a.status === "Selected").length, 0);
          return (
            <div key={c.id} className="card card-pad card-clickable" onClick={() => navigate(`/professor/companies/${c.id}`)}>
              <div className="flex gap-12">
                <div className="company-logo">{c.logoInitials}</div>
                <div style={{ flex: 1 }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold">{c.name}</div>
                      <div className="text-muted text-sm">{c.industry} · {c.location}</div>
                    </div>
                    {c.verified && <Badge variant="success">Verified</Badge>}
                  </div>
                </div>
              </div>
              <div className="grid grid-3 mt-16 text-sm">
                <div><div className="text-muted text-xs">Listings</div><div className="font-semibold">{listings.length}</div></div>
                <div><div className="text-muted text-xs">Applicants</div><div className="font-semibold">{applicantCount}</div></div>
                <div><div className="text-muted text-xs">Selected</div><div className="font-semibold">{selected}</div></div>
              </div>
              <div className="mt-16">
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/professor/companies/${c.id}`); }}>View Company</button>
                <button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); navigate(`/professor/companies/${c.id}`); }}>View Listings</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
