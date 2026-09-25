import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="flex items-center gap-8 mb-24">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--color-primary)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>CL</div>
          <div>
            <div className="font-bold text-lg">CampusLink</div>
            <div className="text-muted text-xs">Internship Management Platform</div>
          </div>
        </div>

        {!sent ? (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>Reset your password</h2>
            <p className="text-muted text-sm mt-4 mb-16">Enter your college email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">College Email</label>
                <input id="email" className="input" type="email" placeholder="you@college.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Send Reset Link</button>
            </form>
          </>
        ) : (
          <div className="state-box" style={{ padding: "24px 0" }}>
            <div className="state-icon">📧</div>
            <div className="state-title">Check your inbox</div>
            <p>If an account exists for <strong>{email}</strong>, a password reset link has been sent.</p>
          </div>
        )}

        <p className="text-sm mt-24" style={{ textAlign: "center" }}>
          <Link to="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}
