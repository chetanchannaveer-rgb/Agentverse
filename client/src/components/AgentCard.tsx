import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import StatusBadge from "./StatusBadge";
import { ExecuteAgentDialog } from "./ExecuteAgentDialog";
import { MoreVertical, Play, Pause, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Agent } from "@shared/schema";

interface AgentCardProps {
  agent?: Agent;
  id: string;
  name: string;
  status: "active" | "idle" | "executing" | "error" | "pending";
  currentTask?: string;
  tasksCompleted: number;
  successRate: number;
  onPause?: () => void;
  onResume?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export default function AgentCard({
  agent,
  id,
  name,
  status,
  currentTask,
  tasksCompleted,
  successRate,
  onPause,
  onResume,
  onDelete,
  onClick,
}: AgentCardProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className="p-6 hover-elevate active-elevate-2 cursor-pointer transition-all"
      onClick={onClick}
      data-testid={`card-agent-${id}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base" data-testid="text-agent-name">{name}</h3>
            <p className="text-xs text-muted-foreground font-mono">{id}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" data-testid="button-agent-menu">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {status === "active" || status === "executing" ? (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onPause?.(); }}>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onResume?.(); }}>
                <Play className="w-4 h-4 mr-2" />
                Resume
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <StatusBadge status={status} className="mb-4" />
      
      {currentTask && (
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-1">Current Task</p>
          <p className="text-sm line-clamp-2">{currentTask}</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div>
          <p className="text-xs text-muted-foreground">Tasks Completed</p>
          <p className="text-lg font-semibold" data-testid="text-tasks-completed">{tasksCompleted}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-lg font-semibold" data-testid="text-success-rate">{successRate}%</p>
        </div>
      </div>

      {agent && (
        <div className="mt-4 pt-4 border-t" onClick={(e) => e.stopPropagation()}>
          <ExecuteAgentDialog agent={agent} />
        </div>
      )}
    </Card>
  );
}
