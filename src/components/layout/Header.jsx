import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { timeAgo } from "../../utils/helpers";

const SEARCH_TARGET = {
  student: { path: "/student/opportunities", placeholder: "Search internships, companies, skills..." },
  professor: { path: "/professor/students", placeholder: "Search students by name or register no..." },
  company: { path: "/company/applicants", placeholder: "Search applicants..." },
};

const PROFILE_PATH = { student: "/student/profile", professor: "/professor/profile", company: "/company/profile" };
const NOTIF_PATH = { student: "/student/notifications", professor: "/professor/notifications", company: "/company/notifications" };

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const data = useData();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const ownerId = user.role === "company" ? user.companyId : user.id;

  const notifList =
    user.role === "student" ? data.studentNotifications.filter((n) => n.studentId === user.id) :
    user.role === "professor" ? data.professorNotifications.filter((n) => n.professorId === user.id) :
    data.companyNotifications.filter((n) => n.companyId === user.companyId);

  const unreadCount = notifList.filter((n) => !n.read).length;

  useEffect(() => {
    function onClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const target = SEARCH_TARGET[user.role];
    navigate(query.trim() ? `${target.path}?q=${encodeURIComponent(query.trim())}` : target.path);
  };

  const handleNotifClick = (n) => {
    data.markNotificationRead(user.role, n.id);
    setShowNotif(false);
    navigate(n.link);
  };

  return (
    <header className="topbar">
      <div className="flex items-center gap-12" style={{ flex: 1, minWidth: 0 }}>
        <button className="hamburger" onClick={onMenuClick} aria-label="Open menu">☰</button>
        <form className="topbar-search" onSubmit={handleSearch}>
          <span>🔍</span>
          <input
            placeholder={SEARCH_TARGET[user.role].placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="flex items-center gap-12">
        <div className="icon-btn-wrap" ref={notifRef}>
          <button className="btn-icon" onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }} aria-label="Notifications">
            🔔{unreadCount > 0 && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="dropdown-panel notif-panel">
              <div className="flex justify-between items-center" style={{ padding: "12px 16px", borderBottom: "1px solid var(--color-border)" }}>
                <span className="font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <button className="btn-ghost btn-sm" style={{ padding: 0, border: "none", background: "none" }} onClick={() => data.markAllNotificationsRead(user.role, ownerId)}>
                    Mark all read
                  </button>
                )}
              </div>
              {notifList.length === 0 ? (
                <div className="state-box" style={{ padding: "28px 16px" }}>
                  <div className="state-icon" style={{ fontSize: 22 }}>🔕</div>
                  <p className="text-sm">No notifications yet.</p>
                </div>
              ) : (
                notifList.slice(0, 6).map((n) => (
                  <div key={n.id} className={`notif-item ${!n.read ? "unread" : ""}`} style={{ cursor: "pointer" }} onClick={() => handleNotifClick(n)}>
                    {!n.read && <span className="n-dot" />}
                    <div>
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-muted mt-4">{n.message}</div>
                      <div className="text-faint mt-4">{timeAgo(n.date)}</div>
                    </div>
                  </div>
                ))
              )}
              <div style={{ padding: "10px 16px", borderTop: "1px solid var(--color-border)" }}>
                <Link to={NOTIF_PATH[user.role]} className="text-sm font-semibold" style={{ color: "var(--color-primary)" }} onClick={() => setShowNotif(false)}>
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="icon-btn-wrap" ref={profileRef}>
          <button className="flex items-center gap-8" style={{ background: "none", border: "none" }} onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}>
            <div className="avatar">{user.initials}</div>
          </button>
          {showProfile && (
            <div className="dropdown-panel">
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--color-border)" }}>
                <div className="font-semibold">{user.name}</div>
                <div className="text-muted text-sm truncate">{user.email}</div>
              </div>
              <Link className="dropdown-item" to={PROFILE_PATH[user.role]} onClick={() => setShowProfile(false)}>
                👤 View Profile
              </Link>
              <Link className="dropdown-item" to={NOTIF_PATH[user.role]} onClick={() => setShowProfile(false)}>
                🔔 Notifications
              </Link>
              <div className="dropdown-divider" />
              <button className="dropdown-item" style={{ width: "100%", textAlign: "left", border: "none", background: "none", color: "var(--color-danger)" }} onClick={logout}>
                ↩ Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
