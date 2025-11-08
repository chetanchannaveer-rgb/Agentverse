import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Cpu } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "agent";
  content: string;
  timestamp: string;
  agentName?: string;
}

export default function ChatMessage({ role, content, timestamp, agentName }: ChatMessageProps) {
  const isUser = role === "user";
  
  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")} data-testid={`message-${role}`}>
      <Avatar className="w-8 h-8 mt-1">
        <AvatarFallback className={cn(
          isUser ? "bg-primary/10 text-primary" : "bg-accent text-accent-foreground"
        )}>
          {isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
        </AvatarFallback>
      </Avatar>
      <div className={cn("flex-1 max-w-[80%]", isUser && "flex flex-col items-end")}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium">
            {isUser ? "You" : agentName || "Agent"}
          </span>
          <span className="text-xs text-muted-foreground font-mono">{timestamp}</span>
        </div>
        <div className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-card border border-card-border"
        )}>
          {content}
        </div>
      </div>
    </div>
  );
}
