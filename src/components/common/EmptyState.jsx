export default function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div className="state-box">
      <div className="state-icon">{icon}</div>
      <div className="state-title">{title}</div>
      {message && <p>{message}</p>}
      {action && <div className="mt-16">{action}</div>}
    </div>
  );
}
