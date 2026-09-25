import { STATUS_COLORS } from "../../data/mockData";

// variant can be explicit ("success" | "warning" | "danger" | "info" | "neutral")
// or omitted to auto-resolve from a known status label.
export default function Badge({ children, variant, status }) {
  const resolved = variant || STATUS_COLORS[status || children] || "neutral";
  return (
    <span className={`badge badge-${resolved}`}>
      <span className="badge-dot" />
      {children}
    </span>
  );
}
