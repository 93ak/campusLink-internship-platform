import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import { useToast } from "../../context/ToastContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function VerificationDetails() {
  const { internshipId } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const { showToast } = useToast();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  const internship = data.getInternship(internshipId);
  if (!internship) return <EmptyState icon="❓" title="Internship record not found" />;

  const student = data.getStudent(internship.studentId);
  const company = data.getCompany(internship.companyId);
  const canAct = internship.verificationStatus !== "Verified";

  const handleVerify = async () => {
    await data.verifyInternship(internship.id);
    navigate("/professor/verification");
  };

  const handleReject = async () => {
    await data.rejectInternshipVerification(internship.id, reason);
    setShowReject(false);
    navigate("/professor/verification");
  };

  return (
    <div>
      <Breadcrumbs items={[{ label: "Internship Verification", to: "/professor/verification" }, { label: student.name }]} />

      <div className="page-header">
        <div>
          <h1 className="page-title">{student.name}'s Internship</h1>
          <p className="page-subtitle">{internship.position} at {company.name}</p>
        </div>
        <Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-12">Internship Details</div>
          <div className="flex-col gap-12 text-sm">
            <div className="flex justify-between"><span className="text-muted">Student</span><span className="font-semibold">{student.name} ({student.registerNumber})</span></div>
            <div className="flex justify-between"><span className="text-muted">Company</span><span className="font-semibold">{company.name}</span></div>
            <div className="flex justify-between"><span className="text-muted">Position</span><span className="font-semibold">{internship.position}</span></div>
            <div className="flex justify-between"><span className="text-muted">Start Date</span><span>{formatDate(internship.startDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted">End Date</span><span>{formatDate(internship.endDate)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Supervisor</span><span>{internship.supervisor}</span></div>
          </div>
        </div>

        <div className="card card-pad">
          <div className="card-title mb-12">Documents</div>
          {internship.documents.map((doc) => (
            <div className="file-row" key={doc.id}>
              <div>
                <div className="font-semibold text-sm">{doc.type}</div>
                <div className="text-muted text-xs">{doc.uploaded ? doc.name : "Not submitted yet"}</div>
              </div>
              {doc.uploaded && <button className="btn btn-ghost btn-sm" onClick={() => showToast(`Opening ${doc.name}...`, "info")}>View Document</button>}
            </div>
          ))}

          {canAct && (
            <div className="flex gap-8 mt-16">
              <button className="btn btn-success" onClick={handleVerify}>Verify Internship</button>
              <button className="btn btn-danger" onClick={() => setShowReject(true)}>Reject / Request Correction</button>
            </div>
          )}
        </div>
      </div>

      {showReject && (
        <Modal
          title="Request Correction"
          onClose={() => setShowReject(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowReject(false)}>Cancel</button>
              <button className="btn btn-danger" disabled={!reason.trim()} onClick={handleReject}>Send to Student</button>
            </>
          }
        >
          <div className="field">
            <label>Reason (required)</label>
            <textarea className="textarea" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what needs to be corrected, e.g. missing joining letter, mismatched dates..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
