import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Tabs from "../../components/common/Tabs";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

const TABS = [
  { key: "Pending Verification", label: "Pending" },
  { key: "Verified", label: "Verified" },
  { key: "Needs Correction", label: "Needs Correction" },
];

export default function Verification() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Pending Verification");

  const myStudentIds = new Set(data.studentsForProfessor(user.id).map((s) => s.id));
  const filtered = data.internships.filter((i) => myStudentIds.has(i.studentId) && i.verificationStatus === tab);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Verification</h1>
          <p className="page-subtitle">Verify internship records submitted by selected students.</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <EmptyState icon="✅" title="Nothing to review" message="No records in this category." />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead><tr><th>Student</th><th>Company</th><th>Position</th><th>Start Date</th><th>End Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((i) => {
                const student = data.getStudent(i.studentId);
                const company = data.getCompany(i.companyId);
                return (
                  <tr key={i.id} className="row-hover">
                    <td>{student.name}</td>
                    <td>{company.name}</td>
                    <td>{i.position}</td>
                    <td className="text-muted">{formatDate(i.startDate)}</td>
                    <td className="text-muted">{formatDate(i.endDate)}</td>
                    <td><Badge status={i.verificationStatus}>{i.verificationStatus}</Badge></td>
                    <td><button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/verification/${i.id}`)}>Review</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
