export default function StatCard({ label, value, detail }) {
  return (
    <div className="panel stat-card">
      <div className="eyebrow">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="muted-text">{detail}</div>
    </div>
  );
}
