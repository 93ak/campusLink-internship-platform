export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function daysUntil(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  d.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / (1000 * 60 * 60 * 24));
}

export function deadlineLabel(dateStr) {
  const n = daysUntil(dateStr);
  if (n < 0) return "Deadline passed";
  if (n === 0) return "Deadline today";
  if (n === 1) return "1 day left";
  return `${n} days left`;
}

export function genId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function timeAgo(dateStr) {
  const n = -daysUntil(dateStr);
  if (n <= 0) return "Today";
  if (n === 1) return "Yesterday";
  if (n < 7) return `${n} days ago`;
  if (n < 30) return `${Math.floor(n / 7)}w ago`;
  return `${Math.floor(n / 30)}mo ago`;
}
