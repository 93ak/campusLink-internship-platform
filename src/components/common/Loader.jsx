export default function Loader({ label = "Loading..." }) {
  return (
    <div className="state-box">
      <div className="spinner" />
      <p className="mt-12">{label}</p>
    </div>
  );
}
