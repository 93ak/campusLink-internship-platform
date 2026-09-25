import { NavLink } from "react-router-dom";

const NAV_BY_ROLE = {
  student: [
    { to: "/student/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/student/opportunities", label: "Internship Opportunities", icon: "🧭" },
    { to: "/student/applications", label: "My Applications", icon: "📄" },
    { to: "/student/interviews", label: "Interviews", icon: "🎤" },
    { to: "/student/internship", label: "My Internship", icon: "💼" },
    { to: "/student/profile", label: "Profile", icon: "👤" },
    { to: "/student/notifications", label: "Notifications", icon: "🔔" },
  ],
  professor: [
    { to: "/professor/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/professor/students", label: "Students", icon: "🎓" },
    { to: "/professor/listings", label: "Internship Listings", icon: "📋" },
    { to: "/professor/applications", label: "Applications", icon: "📄" },
    { to: "/professor/verification", label: "Internship Verification", icon: "✅" },
    { to: "/professor/companies", label: "Companies", icon: "🏢" },
    { to: "/professor/reports", label: "Reports", icon: "📊" },
    { to: "/professor/notifications", label: "Notifications", icon: "🔔" },
    { to: "/professor/profile", label: "Profile", icon: "👤" },
  ],
  company: [
    { to: "/company/dashboard", label: "Dashboard", icon: "🏠" },
    { to: "/company/profile", label: "Company Profile", icon: "🏢" },
    { to: "/company/listings", label: "My Listings", icon: "📋" },
    { to: "/company/listings/new", label: "Create Listing", icon: "➕" },
    { to: "/company/applicants", label: "Applicants", icon: "🧑‍🎓" },
    { to: "/company/interviews", label: "Interviews", icon: "🎤" },
    { to: "/company/selected", label: "Selected Students", icon: "🏆" },
    { to: "/company/notifications", label: "Notifications", icon: "🔔" },
  ],
};

const ROLE_LABEL = { student: "Student Portal", professor: "Faculty Portal", company: "Company / HR Portal" };

export default function Sidebar({ role, open, onNavigate }) {
  const items = NAV_BY_ROLE[role] || [];
  return (
    <>
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="mark">CL</div>
          <div>
            <div className="name">CampusLink</div>
            <div className="role-tag">{ROLE_LABEL[role]}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
              onClick={onNavigate}
            >
              <span className="icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer text-xs" style={{ color: "#7c85a0" }}>
          © {new Date().getFullYear()} CampusLink · College Internship Cell
        </div>
      </aside>
    </>
  );
}
