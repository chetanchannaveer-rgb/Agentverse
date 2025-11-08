import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MetricCard from "@/components/MetricCard";
import AgentCard from "@/components/AgentCard";
import ActivityFeedItem from "@/components/ActivityFeedItem";
import { UnifiedChat } from "@/components/UnifiedChat";
import { CreateAgentDialog } from "@/components/CreateAgentDialog";
import { Cpu, Activity, CheckCircle, Plus, Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Agent } from "@shared/schema";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: agents = [], isLoading: agentsLoading, error: agentsError } = useQuery<Agent[]>({
    queryKey: ["/api/agents"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (agentId: string) => {
      const response = await apiRequest("DELETE", `/api/agents/${agentId}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent Deleted",
        description: "The agent has been removed successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete agent",
        variant: "destructive",
      });
    },
  });

  const mockActivities = [
    { title: "Agent Created", description: "New agent 'Code Generator' initialized with default capabilities", timestamp: "2m ago", type: "success" as const },
    { title: "Task Completed", description: "Successfully generated 3 React components with TypeScript", timestamp: "5m ago", type: "success" as const },
    { title: "Execution Error", description: "Failed to compile generated code due to syntax error in line 42", timestamp: "12m ago", type: "error" as const },
    { title: "System Update", description: "LLM provider switched from local simulator to OpenAI GPT-4", timestamp: "1h ago", type: "info" as const },
  ];

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeAgents = agents.filter(a => a.status === "executing" || a.status === "active").length;
  const avgSuccessRate = agents.length > 0
    ? Math.round(agents.reduce((sum, a) => sum + a.successRate, 0) / agents.length)
    : 100;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="py-12 px-8 border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage your autonomous agents</p>
            </div>
            <div className="flex gap-2">
              <CreateAgentDialog
                onAgentCreated={(agent) => {
                  queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
                }}
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Agents"
              value={agentsLoading ? "-" : agents.length}
              trend={{ value: 8.2, direction: "up" }}
              icon={<Cpu className="w-6 h-6" />}
            />
            <MetricCard
              title="Active Tasks"
              value={agentsLoading ? "-" : activeAgents}
              trend={{ value: -3.1, direction: "down" }}
              icon={<Activity className="w-6 h-6" />}
            />
            <MetricCard
              title="Success Rate"
              value={agentsLoading ? "-" : `${avgSuccessRate}%`}
              trend={{ value: 2.5, direction: "up" }}
              icon={<CheckCircle className="w-6 h-6" />}
            />
          </div>
        </div>
      </div>

      {/* Agent Grid Section */}
      <div className="py-8 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Active Agents</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-agents"
              />
            </div>
          </div>

          {agentsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : agentsError ? (
            <Card className="p-6 text-center">
              <p className="text-destructive">Failed to load agents. Please try again.</p>
            </Card>
          ) : filteredAgents.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `No agents found matching "${searchQuery}"` : "No agents created yet"}
              </p>
              {!searchQuery && (
                <CreateAgentDialog
                  onAgentCreated={() => queryClient.invalidateQueries({ queryKey: ["/api/agents"] })}
                />
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  id={agent.id}
                  name={agent.name}
                  status={agent.status as any}
                  currentTask={agent.description || undefined}
                  tasksCompleted={agent.tasksCompleted}
                  successRate={agent.successRate}
                  onPause={() => console.log(`Pause ${agent.id}`)}
                  onResume={() => console.log(`Resume ${agent.id}`)}
                  onDelete={() => deleteMutation.mutate(agent.id)}
                  onClick={() => console.log(`View ${agent.id} details`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Unified Chat & Activity Feed */}
      <div className="py-8 px-8 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold mb-6">AI Assistant Chat</h2>
              <div className="h-[600px]">
                <UnifiedChat />
              </div>
              <div className="mt-8">
                <h2 className="text-2xl font-semibold mb-6">Activity Timeline</h2>
                <div>
                  {mockActivities.map((activity, index) => (
                    <ActivityFeedItem
                      key={index}
                      {...activity}
                      isLast={index === mockActivities.length - 1}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold mb-6">System Stats</h2>
              <Card className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">CPU Usage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[45%]" />
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Memory Usage</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary w-[62%]" />
                    </div>
                    <span className="text-sm font-medium">62%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">LLM Provider</p>
                  <p className="text-sm font-medium">Local Simulator</p>
                  <p className="text-xs text-muted-foreground mt-1">Add API key to enable real LLM</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
