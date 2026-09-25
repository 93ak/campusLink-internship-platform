import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import EmptyState from "../../components/common/EmptyState";
import { formatDate } from "../../utils/helpers";

const ICONS = { listing_approved: "✅", new_applicant: "🧑‍🎓", listing_pending: "⏳" };

export default function Notifications() {
  const { user } = useAuth();
  const data = useData();
  const navigate = useNavigate();

  const notifs = data.companyNotifications.filter((n) => n.companyId === user.companyId).slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && <button className="btn btn-secondary" onClick={() => data.markAllNotificationsRead("company", user.companyId)}>Mark All as Read</button>}
      </div>

      {notifs.length === 0 ? (
        <EmptyState icon="🔕" title="No notifications yet" />
      ) : (
        <div className="card">
          {notifs.map((n) => (
            <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`} style={{ padding: "16px 20px" }}>
              <div style={{ fontSize: 18 }}>{ICONS[n.type] || "🔔"}</div>
              <div style={{ flex: 1 }}>
                <div className="font-semibold text-sm">{n.title}</div>
                <div className="text-muted text-sm mt-4">{n.message}</div>
                <div className="text-faint text-xs mt-8">{formatDate(n.date)}</div>
                <div className="flex gap-12 mt-12">
                  {!n.read && <button className="btn btn-ghost btn-sm" onClick={() => data.markNotificationRead("company", n.id)}>Mark as Read</button>}
                  <button className="btn btn-secondary btn-sm" onClick={() => { data.markNotificationRead("company", n.id); navigate(n.link); }}>Open Related Item</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
