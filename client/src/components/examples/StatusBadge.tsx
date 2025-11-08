import StatusBadge from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="flex gap-2 flex-wrap">
      <StatusBadge status="active" />
      <StatusBadge status="idle" />
      <StatusBadge status="executing" />
      <StatusBadge status="error" />
      <StatusBadge status="pending" />
    </div>
  );
}
