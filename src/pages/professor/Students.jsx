import { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import EmptyState from "../../components/common/EmptyState";

export default function Students() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [year, setYear] = useState("All");
  const [status, setStatus] = useState("All");

  const myStudents = data.studentsForProfessor(user.id);

  const rows = useMemo(() => {
    return myStudents.map((s) => {
      const apps = data.applicationsForStudent(s.id);
      const internship = data.internships.find((i) => i.studentId === s.id);
      const internshipStatus = internship ? internship.status : "Not Placed";
      return { student: s, appCount: apps.length, internship, internshipStatus };
    });
  }, [myStudents, data]);

  const filtered = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    const matchesSearch = !q || r.student.name.toLowerCase().includes(q) || r.student.registerNumber.toLowerCase().includes(q);
    const matchesYear = year === "All" || r.student.year === year;
    const matchesStatus = status === "All" || r.internshipStatus === status;
    return matchesSearch && matchesYear && matchesStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{myStudents.length} students in your department</p>
        </div>
      </div>

      <div className="card card-pad mb-16 flex gap-12 wrap">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search name or register no..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" style={{ maxWidth: 160 }} value={year} onChange={(e) => setYear(e.target.value)}>
          <option>All</option>
          <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
        </select>
        <select className="select" style={{ maxWidth: 200 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option>All</option>
          <option>Not Placed</option><option>Upcoming</option><option>Ongoing</option><option>Completed</option><option>Verified</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="🎓" title="No students found" message="Try adjusting your search or filters." />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th><th>Register No.</th><th>Year</th><th>CGPA</th><th>Applications</th><th>Internship Status</th><th>Verification</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ student, appCount, internship, internshipStatus }) => (
                <tr key={student.id} className="row-hover">
                  <td>
                    <div className="flex items-center gap-12">
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{student.photoInitials}</div>
                      {student.name}
                    </div>
                  </td>
                  <td className="text-muted">{student.registerNumber}</td>
                  <td>{student.year}</td>
                  <td>{student.cgpa}</td>
                  <td>{appCount}</td>
                  <td><Badge status={internshipStatus}>{internshipStatus}</Badge></td>
                  <td>{internship ? <Badge status={internship.verificationStatus}>{internship.verificationStatus}</Badge> : <span className="text-faint">—</span>}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/professor/students/${student.id}`)}>View Profile</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
