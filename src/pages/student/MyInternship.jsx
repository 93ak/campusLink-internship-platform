import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import FileUploadButton from "../../components/common/FileUploadButton";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/helpers";

export default function MyInternship() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const internship = data.internships.find((i) => i.studentId === user.id);

  if (!internship) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">My Internship</h1>
            <p className="page-subtitle">Details of your current or completed internship.</p>
          </div>
        </div>
        <EmptyState
          icon="💼"
          title="You haven't been selected for an internship yet"
          message="Once a company selects you for a role, your internship details will show up here."
          action={<button className="btn btn-primary" onClick={() => navigate("/student/opportunities")}>Browse Internships</button>}
        />
      </div>
    );
  }

  const listing = data.getListing(internship.listingId);
  const company = data.getCompany(internship.companyId);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Internship</h1>
          <p className="page-subtitle">{internship.position} at {company.name}</p>
        </div>
        <div className="flex gap-8">
          <Badge status={internship.status}>{internship.status}</Badge>
          <Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-12">Internship Details</div>
          <div className="flex-col gap-12 text-sm">
            <div className="flex justify-between"><span className="text-muted">Company</span><span className="font-semibold">{company.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">Position</span><span className="font-semibold">{internship.position}</span></div>
            <div className="flex justify-between"><span className="text-muted">Start Date</span><span>{formatDate(internship.startDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted">End Date</span><span>{formatDate(internship.endDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Duration</span><span>{internship.duration}</span></div>
            <div className="flex justify-between"><span className="text-muted">Stipend</span><span>{internship.stipend}</span></div>
            <div className="flex justify-between"><span className="text-muted">Supervisor</span><span>{internship.supervisor}</span></div>
          </div>
          <div className="divider" />
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-sm">Professor Verification</div>
              <div className="text-muted text-xs">Your department professor verifies this internship record.</div>
            </div>
            <Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge>
          </div>
          {internship.verificationStatus === "Needs Correction" && internship.verificationNote && (
            <div className="mt-12 text-sm" style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)", padding: 12, borderRadius: 8 }}>
              <strong>Correction requested:</strong> {internship.verificationNote}
            </div>
          )}
        </div>

        <div className="card card-pad">
          <div className="card-title mb-12">Documents</div>
          {internship.documents.map((doc) => (
            <div className="file-row" key={doc.id}>
              <div>
                <div className="font-semibold text-sm">{doc.type}</div>
                <div className="text-muted text-xs">{doc.uploaded ? doc.name : "Not uploaded yet"}</div>
              </div>
              <div className="flex gap-8">
                {doc.uploaded ? (
                  <>
                    <button className="btn btn-ghost btn-sm" onClick={() => showToast(`Opening ${doc.name}...`, "info")}>View</button>
                    <button className="btn-icon" title="Delete document" onClick={() => data.deleteInternshipDocument(internship.id, doc.id)}>🗑</button>
                  </>
                ) : (
                  <FileUploadButton label="Upload Document" onFile={(filename) => data.uploadInternshipDocument(internship.id, doc.id, filename)} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
