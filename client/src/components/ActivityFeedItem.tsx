import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";

interface ActivityFeedItemProps {
  title: string;
  description: string;
  timestamp: string;
  type: "success" | "error" | "info" | "warning";
  isLast?: boolean;
}

const typeConfig = {
  success: "text-green-600 dark:text-green-400 bg-green-500/10",
  error: "text-red-600 dark:text-red-400 bg-red-500/10",
  info: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  warning: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10",
};

export default function ActivityFeedItem({ title, description, timestamp, type, isLast }: ActivityFeedItemProps) {
  return (
    <div className="flex gap-4" data-testid="item-activity">
      <div className="flex flex-col items-center">
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", typeConfig[type])}>
          <Circle className="w-3 h-3 fill-current" />
        </div>
        {!isLast && <div className="w-px h-full bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h4 className="font-medium text-sm" data-testid="text-activity-title">{title}</h4>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          <span className="text-xs text-muted-foreground font-mono whitespace-nowrap">{timestamp}</span>
        </div>
      </div>
    </div>
  );
}
