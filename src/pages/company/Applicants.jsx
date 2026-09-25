import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Breadcrumbs from "../../components/common/Breadcrumbs";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import { useToast } from "../../context/ToastContext";
import { formatDate } from "../../utils/helpers";

export default function Applicants() {
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const data = useData();
  const { showToast } = useToast();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [statusFilter, setStatusFilter] = useState("All");
  const [rejectTarget, setRejectTarget] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ round: "Technical Round 1", date: "", time: "", mode: "Online", locationOrLink: "", instructions: "" });

  const myListings = data.listingsForCompany(user.companyId);
  const myListingIds = new Set(myListings.map((l) => l.id));

  const scopedListing = listingId ? data.getListing(listingId) : null;
  if (listingId && (!scopedListing || scopedListing.companyId !== user.companyId)) {
    return <EmptyState icon="🔒" title="Listing not found or access denied" />;
  }

  const rows = useMemo(() => {
    return data.applications
      .filter((a) => myListingIds.has(a.listingId))
      .filter((a) => !listingId || a.listingId === listingId)
      .filter((a) => statusFilter === "All" || a.status === statusFilter)
      .filter((a) => {
        if (!search.trim()) return true;
        const s = data.getStudent(a.studentId);
        return s.name.toLowerCase().includes(search.toLowerCase());
      })
      .slice()
      .sort((a, b) => (a.appliedDate < b.appliedDate ? 1 : -1));
  }, [data.applications, listingId, statusFilter, search]);

  const openSchedule = (app) => {
    setScheduleForm({ round: "Technical Round 1", date: "", time: "", mode: "Online", locationOrLink: "", instructions: "" });
    setScheduleTarget(app);
  };

  const submitSchedule = () => {
    data.scheduleInterview(scheduleTarget.id, scheduleForm);
    setScheduleTarget(null);
  };

  return (
    <div>
      {scopedListing && <Breadcrumbs items={[{ label: "My Listings", to: "/company/listings" }, { label: scopedListing.title, to: `/company/listings/${scopedListing.id}` }, { label: "Applicants" }]} />}

      <div className="page-header">
        <div>
          <h1 className="page-title">{scopedListing ? `Applicants — ${scopedListing.title}` : "All Applicants"}</h1>
          <p className="page-subtitle">{rows.length} applicant{rows.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="card card-pad mb-16 flex gap-12 wrap">
        <input className="input" style={{ maxWidth: 280 }} placeholder="Search by student name..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="select" style={{ maxWidth: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option>All</option>
          <option>Applied</option><option>Shortlisted</option><option>Interview Scheduled</option><option>Selected</option><option>Rejected</option>
        </select>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon="🧑‍🎓" title="No applicants found" message="Applicants will appear here once students apply." />
      ) : (
        <div className="card scroll-x">
          <table className="table">
            <thead><tr><th>Student</th><th>Department</th><th>Year</th><th>CGPA</th><th>Applied</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {rows.map((a) => {
                const student = data.getStudent(a.studentId);
                return (
                  <tr key={a.id} className="row-hover">
                    <td>
                      <div className="flex items-center gap-12">
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>{student.photoInitials}</div>
                        {student.name}
                      </div>
                    </td>
                    <td className="text-muted">{student.department}</td>
                    <td>{student.year}</td>
                    <td>{student.cgpa}</td>
                    <td className="text-muted">{formatDate(a.appliedDate)}</td>
                    <td><Badge status={a.status}>{a.status}</Badge></td>
                    <td>
                      <div className="flex gap-8 wrap">
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/applicants/${a.id}`)}>View Profile</button>
                        {a.status === "Applied" && (
                          <>
                            <button className="btn btn-secondary btn-sm" onClick={() => data.shortlistApplicant(a.id)}>Shortlist</button>
                            <button className="btn btn-secondary btn-sm" style={{ color: "var(--color-danger)" }} onClick={() => setRejectTarget(a)}>Reject</button>
                          </>
                        )}
                        {a.status === "Shortlisted" && (
                          <button className="btn btn-primary btn-sm" onClick={() => openSchedule(a)}>Schedule Interview</button>
                        )}
                        {a.status === "Interview Scheduled" && (
                          <button className="btn btn-ghost btn-sm" onClick={() => navigate("/company/interviews")}>View Interview</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectTarget && (
        <ConfirmDialog
          title="Reject Applicant?"
          message={`Are you sure you want to reject ${data.getStudent(rejectTarget.studentId).name}'s application? They will be notified.`}
          confirmLabel="Reject Applicant"
          danger
          onCancel={() => setRejectTarget(null)}
          onConfirm={() => { data.rejectApplicant(rejectTarget.id); setRejectTarget(null); }}
        />
      )}

      {scheduleTarget && (
        <Modal
          title={`Schedule Interview — ${data.getStudent(scheduleTarget.studentId).name}`}
          onClose={() => setScheduleTarget(null)}
          wide
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setScheduleTarget(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={!scheduleForm.date || !scheduleForm.time || !scheduleForm.locationOrLink} onClick={submitSchedule}>Schedule Interview</button>
            </>
          }
        >
          <div className="form-grid">
            <div className="field">
              <label>Interview Round</label>
              <select className="select" value={scheduleForm.round} onChange={(e) => setScheduleForm((f) => ({ ...f, round: e.target.value }))}>
                <option>Technical Round 1</option><option>Technical Round 2</option><option>HR Round</option><option>Final Round</option>
              </select>
            </div>
            <div className="field">
              <label>Mode</label>
              <select className="select" value={scheduleForm.mode} onChange={(e) => setScheduleForm((f) => ({ ...f, mode: e.target.value }))}>
                <option>Online</option><option>On-site</option>
              </select>
            </div>
          </div>
          <div className="form-grid">
            <div className="field"><label>Date</label><input className="input" type="date" value={scheduleForm.date} onChange={(e) => setScheduleForm((f) => ({ ...f, date: e.target.value }))} /></div>
            <div className="field"><label>Time</label><input className="input" type="time" value={scheduleForm.time} onChange={(e) => setScheduleForm((f) => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div className="field">
            <label>{scheduleForm.mode === "Online" ? "Meeting Link" : "Location"}</label>
            <input className="input" value={scheduleForm.locationOrLink} onChange={(e) => setScheduleForm((f) => ({ ...f, locationOrLink: e.target.value }))} placeholder={scheduleForm.mode === "Online" ? "https://meet.example.com/room" : "Office address"} />
          </div>
          <div className="field">
            <label>Instructions</label>
            <textarea className="textarea" value={scheduleForm.instructions} onChange={(e) => setScheduleForm((f) => ({ ...f, instructions: e.target.value }))} placeholder="What should the candidate prepare or bring?" />
          </div>
        </Modal>
      )}
    </div>
  );
}
