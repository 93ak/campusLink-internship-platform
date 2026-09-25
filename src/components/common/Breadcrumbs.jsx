import { Link } from "react-router-dom";

export default function Breadcrumbs({ items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-4">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {idx < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </div>
  );
}
