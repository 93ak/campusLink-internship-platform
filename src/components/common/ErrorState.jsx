export default function ErrorState({ title = "Something went wrong", message = "We couldn't load this data. Please try again.", onRetry }) {
  return (
    <div className="state-box">
      <div className="state-icon">⚠️</div>
      <div className="state-title">{title}</div>
      <p>{message}</p>
      {onRetry && (
        <div className="mt-16">
          <button className="btn btn-secondary" onClick={onRetry}>Try Again</button>
        </div>
      )}
    </div>
  );
}
