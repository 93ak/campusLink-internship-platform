export default function StatCard({ label, value, sub, icon, tone = "info" }) {
  const tones = {
    info: { bg: "var(--color-info-bg)", color: "var(--color-info)" },
    success: { bg: "var(--color-success-bg)", color: "var(--color-success)" },
    warning: { bg: "var(--color-warning-bg)", color: "var(--color-warning)" },
    danger: { bg: "var(--color-danger-bg)", color: "var(--color-danger)" },
    neutral: { bg: "var(--color-neutral-bg)", color: "var(--color-text-muted)" },
  };
  const t = tones[tone] || tones.info;
  return (
    <div className="stat-card">
      <div className="flex justify-between items-center">
        <div className="stat-label">{label}</div>
        {icon && <div className="stat-icon" style={{ background: t.bg, color: t.color }}>{icon}</div>}
      </div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
