import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import Tabs from "../../components/common/Tabs";
import { formatDate } from "../../utils/helpers";

const TABS = [
  { key: "Scheduled", label: "Upcoming" },
  { key: "Completed", label: "Completed" },
  { key: "Cancelled", label: "Cancelled" },
];

export default function Interviews() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Scheduled");
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [form, setForm] = useState({ date: "", time: "", mode: "Online", locationOrLink: "", instructions: "" });

  const myListingIds = new Set(data.listingsForCompany(user.companyId).map((l) => l.id));
  const myInterviews = data.interviews.filter((i) => myListingIds.has(i.listingId)).filter((i) => i.status === tab).slice().sort((a, b) => (a.date < b.date ? -1 : 1));

  const openReschedule = (iv) => {
    setForm({ date: iv.date, time: iv.time, mode: iv.mode, locationOrLink: iv.locationOrLink, instructions: iv.instructions });
    setRescheduleTarget(iv);
  };

  const submitReschedule = () => {
    data.rescheduleInterview(rescheduleTarget.id, form);
    setRescheduleTarget(null);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Interview Management</h1>
          <p className="page-subtitle">All interviews scheduled across your listings.</p>
        </div>
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {myInterviews.length === 0 ? (
        <EmptyState icon="🎤" title="No interviews here" />
      ) : (
        myInterviews.map((iv) => {
          const student = data.getStudent(iv.studentId);
          const listing = data.getListing(iv.listingId);
          return (
            <div key={iv.id} className="card card-pad mb-16">
              <div className="flex justify-between wrap" style={{ alignItems: "flex-start" }}>
                <div className="flex gap-12">
                  <div className="avatar">{student.photoInitials}</div>
                  <div>
                    <div className="font-bold">{student.name}</div>
                    <div className="text-muted text-sm">{iv.round} · {listing.title}</div>
                  </div>
                </div>
                <Badge status={iv.status}>{iv.status}</Badge>
              </div>
              <div className="grid grid-3 mt-16 text-sm">
                <div><span className="text-muted">Date</span><div className="font-semibold">{formatDate(iv.date)}</div></div>
                <div><span className="text-muted">Time</span><div className="font-semibold">{iv.time}</div></div>
                <div><span className="text-muted">Mode</span><div className="font-semibold">{iv.mode}</div></div>
              </div>
              <div className="mt-12 text-sm"><span className="text-muted">{iv.mode === "Online" ? "Link" : "Location"}: </span>{iv.locationOrLink}</div>
              <div className="flex gap-8 wrap mt-16">
                <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/company/applicants/${iv.applicationId}`)}>View Details</button>
                {iv.status === "Scheduled" && (
                  <>
                    <button className="btn btn-secondary btn-sm" onClick={() => openReschedule(iv)}>Reschedule</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setCancelTarget(iv)}>Cancel Interview</button>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

      {rescheduleTarget && (
        <Modal
          title="Reschedule Interview"
          onClose={() => setRescheduleTarget(null)}
          footer={<>
            <button className="btn btn-secondary" onClick={() => setRescheduleTarget(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={submitReschedule}>Save Changes</button>
          </>}
        >
          <div className="form-grid">
            <div className="field"><label>Date</label><input className="input" type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} /></div>
            <div className="field"><label>Time</label><input className="input" type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></div>
          </div>
          <div className="field">
            <label>{form.mode === "Online" ? "Meeting Link" : "Location"}</label>
            <input className="input" value={form.locationOrLink} onChange={(e) => setForm((f) => ({ ...f, locationOrLink: e.target.value }))} />
          </div>
          <div className="field">
            <label>Instructions</label>
            <textarea className="textarea" value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} />
          </div>
        </Modal>
      )}

      {cancelTarget && (
        <ConfirmDialog
          title="Cancel Interview?"
          message={`Cancel the ${cancelTarget.round} interview with ${data.getStudent(cancelTarget.studentId).name}? They will be notified.`}
          confirmLabel="Cancel Interview"
          danger
          onCancel={() => setCancelTarget(null)}
          onConfirm={() => { data.cancelInterview(cancelTarget.id); setCancelTarget(null); }}
        />
      )}
    </div>
  );
}
