import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function SelectedStudents() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();

  const myListingIds = new Set(data.listingsForCompany(user.companyId).map((l) => l.id));
  const selectedApps = data.applications.filter((a) => myListingIds.has(a.listingId) && a.status === "Selected");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Selected Students</h1>
          <p className="page-subtitle">Candidates who have accepted an offer with your company.</p>
        </div>
      </div>

      {selectedApps.length === 0 ? (
        <EmptyState icon="🏆" title="No candidates selected yet" message="Once you select a candidate after interviews, they'll appear here." />
      ) : (
        <div className="grid grid-2">
          {selectedApps.map((a) => {
            const student = data.getStudent(a.studentId);
            const listing = data.getListing(a.listingId);
            const internship = data.internships.find((i) => i.applicationId === a.id);
            return (
              <div key={a.id} className="card card-pad">
                <div className="flex justify-between" style={{ alignItems: "flex-start" }}>
                  <div className="flex gap-12">
                    <div className="avatar">{student.photoInitials}</div>
                    <div>
                      <div className="font-bold">{student.name}</div>
                      <div className="text-muted text-sm">{listing.title}</div>
                    </div>
                  </div>
                  {internship && <Badge status={internship.status}>{internship.status}</Badge>}
                </div>
                {internship && (
                  <div className="grid grid-2 mt-16 text-sm">
                    <div><div className="text-muted text-xs">Start Date</div><div className="font-semibold">{formatDate(internship.startDate)}</div></div>
                    <div><div className="text-muted text-xs">End Date</div><div className="font-semibold">{formatDate(internship.endDate)}</div></div>
                    <div><div className="text-muted text-xs">Stipend</div><div className="font-semibold">{internship.stipend}</div></div>
                    <div><div className="text-muted text-xs">Verification</div><Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge></div>
                  </div>
                )}
                <div className="mt-16">
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/applicants/${a.id}`)}>View Profile</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
