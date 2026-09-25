import { useNavigate, useParams } from "react-router-dom";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const data = useData();
  const student = data.getStudent(studentId);

  if (!student) return <EmptyState icon="❓" title="Student not found" />;

  const apps = data.applicationsForStudent(student.id);
  const internship = data.internships.find((i) => i.studentId === student.id);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Students", to: "/professor/students" }, { label: student.name }]} />

      <div className="card card-pad mb-24 flex items-center gap-16 wrap">
        <div className="avatar avatar-lg">{student.photoInitials}</div>
        <div style={{ flex: 1 }}>
          <div className="font-bold text-lg">{student.name}</div>
          <div className="text-muted text-sm">{student.registerNumber} · {student.department} · {student.year}</div>
          <div className="text-muted text-sm">{student.email} · {student.phone}</div>
        </div>
        <div className="text-right">
          <div className="text-muted text-xs">CGPA</div>
          <div className="font-bold text-lg">{student.cgpa}</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card card-pad">
          <div className="card-title mb-12">Skills</div>
          <div className="flex gap-8 wrap mb-16">{student.skills.map((s) => <span key={s} className="tag-chip">{s}</span>)}</div>
          <div className="card-title mb-12">Projects</div>
          {student.projects.map((p, i) => (
            <div key={i} className="card card-pad mb-8" style={{ background: "var(--color-bg)" }}>
              <div className="font-semibold text-sm">{p.title}</div>
              <div className="text-muted text-sm">{p.desc}</div>
            </div>
          ))}
          <div className="text-sm mt-12">
            <span className="text-muted">GitHub: </span>{student.github} &nbsp;·&nbsp; <span className="text-muted">LinkedIn: </span>{student.linkedin}
          </div>
        </div>

        <div className="flex-col gap-24">
          <div className="card card-pad">
            <div className="flex justify-between items-center mb-12">
              <div className="card-title">Applications ({apps.length})</div>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/applications?student=${student.id}`)}>View Applications</button>
            </div>
            {apps.length === 0 ? <EmptyState icon="📄" title="No applications yet" /> : apps.slice(0, 4).map((a) => {
              const l = data.getListing(a.listingId);
              return (
                <div key={a.id} className="flex justify-between items-center mb-12">
                  <div className="text-sm">{l.title}</div>
                  <Badge status={a.status}>{a.status}</Badge>
                </div>
              );
            })}
          </div>

          <div className="card card-pad">
            <div className="flex justify-between items-center mb-12">
              <div className="card-title">Internship</div>
              {internship && <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/verification/${internship.id}`)}>View Internship</button>}
            </div>
            {!internship ? (
              <EmptyState icon="💼" title="No internship record yet" />
            ) : (
              <div className="text-sm flex-col gap-8">
                <div className="flex justify-between"><span className="text-muted">Company</span><span>{data.getCompany(internship.companyId).name}</span></div>
                <div className="flex justify-between"><span className="text-muted">Position</span><span>{internship.position}</span></div>
                <div className="flex justify-between"><span className="text-muted">Status</span><Badge status={internship.status}>{internship.status}</Badge></div>
                <div className="flex justify-between"><span className="text-muted">Verification</span><Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card card-pad mt-24" style={{ background: "var(--color-info-bg)" }}>
        <p className="text-sm" style={{ color: "var(--color-info)" }}>
          Academic data is read-only here. Faculty cannot edit a student's profile, applications, or recruitment decisions directly.
        </p>
      </div>
    </div>
  );
}
