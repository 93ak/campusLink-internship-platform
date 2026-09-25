import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ROLES = [
  { key: "student", label: "Student", icon: "🎓", desc: "Browse internships & track applications" },
  { key: "professor", label: "Professor", icon: "🧑‍🏫", desc: "Approve listings & verify internships" },
  { key: "company", label: "Company HR", icon: "🏢", desc: "Post roles & manage candidates" },
];

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(role);
      showToast(`Welcome back! Signed in as ${ROLES.find((r) => r.key === role).label}.`, "success");
      navigate(`/${role}/dashboard`);
    } catch (err) {
      showToast(`Couldn't sign in: ${err.message}`, "danger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="flex items-center gap-8 mb-24">
          <div className="mark" style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>CL</div>
          <div>
            <div className="font-bold text-lg">CampusLink</div>
            <div className="text-muted text-xs">Internship Management Platform</div>
          </div>
        </div>

        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Sign in to your account</h2>
        <p className="text-muted text-sm mt-4 mb-16">Use the demo role selector, then sign in with any credentials.</p>

        <div className="field">
          <label>Sign in as</label>
          <div className="grid grid-3" style={{ gap: 8 }}>
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.key}
                onClick={() => setRole(r.key)}
                className="card"
                style={{
                  padding: "10px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  borderColor: role === r.key ? "var(--color-primary)" : "var(--color-border)",
                  background: role === r.key ? "var(--color-primary-light)" : "var(--color-surface)",
                }}
              >
                <div style={{ fontSize: 18 }}>{r.icon}</div>
                <div className="text-xs font-semibold mt-4">{r.label}</div>
              </button>
            ))}
          </div>
          <div className="hint mt-4">{ROLES.find((r) => r.key === role).desc}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">College Email</label>
            <input id="email" className="input" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="flex justify-between items-center mb-16">
            <label className="checkbox-row">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="text-sm font-semibold" style={{ color: "var(--color-primary)" }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? "Signing in..." : `Sign In as ${ROLES.find((r) => r.key === role).label}`}
          </button>
        </form>

        <p className="text-faint text-xs mt-16" style={{ textAlign: "center" }}>
          This is a frontend prototype — no real authentication is performed.
        </p>
      </div>
    </div>
  );
}
