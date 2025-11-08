import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface StudyScheduleCardProps {
  id: string;
  topic: string;
  date: string;
  time: string;
  duration: string;
  status: "upcoming" | "completed" | "missed";
  onComplete?: () => void;
  onDelete?: () => void;
}

export default function StudyScheduleCard({
  id,
  topic,
  date,
  time,
  duration,
  status,
  onComplete,
  onDelete,
}: StudyScheduleCardProps) {
  const [localStatus, setLocalStatus] = useState(status);

  const statusConfig = {
    upcoming: { label: "Upcoming", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
    completed: { label: "Completed", className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20" },
    missed: { label: "Missed", className: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
  };

  const handleComplete = () => {
    setLocalStatus("completed");
    onComplete?.();
  };

  return (
    <Card className="p-4 hover-elevate transition-all" data-testid={`card-schedule-${id}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3 className="font-semibold" data-testid="text-schedule-topic">{topic}</h3>
          </div>
          <Badge variant="outline" className={statusConfig[localStatus].className}>
            {statusConfig[localStatus].label}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{time} ({duration})</span>
        </div>
      </div>

      {localStatus === "upcoming" && (
        <div className="flex gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleComplete}
            data-testid="button-mark-complete"
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Complete
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            data-testid="button-delete-schedule"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
