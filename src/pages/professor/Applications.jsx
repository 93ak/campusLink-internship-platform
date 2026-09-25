import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function Applications() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("All");

  const studentFilter = searchParams.get("student");
  const myStudentIds = new Set(data.studentsForProfessor(user.id).map((s) => s.id));

  const rows = useMemo(() => {
    return data.applications
      .filter((a) => myStudentIds.has(a.studentId))
      .filter((a) => !studentFilter || a.studentId === studentFilter)
      .filter((a) => status === "All" || a.status === status)
      .slice()
      .sort((a, b) => (a.lastUpdated < b.lastUpdated ? 1 : -1));
  }, [data.applications, status, studentFilter]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Application Monitoring</h1>
          <p className="page-subtitle">Read-only view of department students' application activity.</p>
        </div>
        <select className="select" style={{ maxWidth: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Applied</option><option>Shortlisted</option><option>Interview Scheduled</option><option>Selected</option><option>Rejected</option><option>Withdrawn</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="📄" title="No applications found" />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead>
              <tr><th>Student</th><th>Company</th><th>Position</th><th>Applied</th><th>Status</th><th>Interview</th><th></th></tr>
            </thead>
            <tbody>
              {rows.map((a) => {
                const student = data.getStudent(a.studentId);
                const listing = data.getListing(a.listingId);
                const company = data.getCompany(listing.companyId);
                const iv = data.interviewsForApplication(a.id)[0];
                return (
                  <tr key={a.id} className="row-hover">
                    <td>{student.name}</td>
                    <td>{company.name}</td>
                    <td>{listing.title}</td>
                    <td className="text-muted">{formatDate(a.appliedDate)}</td>
                    <td><Badge status={a.status}>{a.status}</Badge></td>
                    <td>{iv ? <Badge status={iv.status}>{iv.status}</Badge> : <span className="text-faint">—</span>}</td>
                    <td>
                      <div className="flex gap-8 wrap">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/students/${student.id}`)}>View Student</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/companies/${company.id}`)}>View Company</button>
                      </div>
                    </td>
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
