import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Status = "active" | "idle" | "executing" | "error" | "pending";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig = {
  active: { label: "Active", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
  idle: { label: "Idle", className: "bg-muted text-muted-foreground border-border" },
  executing: { label: "Executing", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
  error: { label: "Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
  pending: { label: "Pending", className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <Badge 
      variant="outline" 
      className={cn("text-xs font-medium px-3 py-1 rounded-full border", config.className, className)}
      data-testid={`badge-status-${status}`}
    >
      {status === "executing" && (
        <span className="inline-block w-1.5 h-1.5 bg-current rounded-full mr-2 animate-pulse" />
      )}
      {config.label}
    </Badge>
  );
}
