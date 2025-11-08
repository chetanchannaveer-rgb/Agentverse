import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Cloud,
  Newspaper,
  Bell,
  Share2,
  Database,
  Plus,
  Sparkles,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  capabilities: string[];
  exampleTask: string;
}

const agentTemplates: AgentTemplate[] = [
  {
    id: "auto-email",
    name: "Auto Email Agent",
    description: "Automatically send scheduled emails based on triggers or time intervals",
    icon: <Mail className="w-6 h-6" />,
    category: "Communication",
    capabilities: ["Schedule emails", "Template management", "Recipient lists", "Delivery tracking"],
    exampleTask: "Send weekly newsletter every Monday at 9 AM",
  },
  {
    id: "weather-report",
    name: "Daily Weather Report",
    description: "Fetch and deliver daily weather reports for specified locations",
    icon: <Cloud className="w-6 h-6" />,
    category: "Information",
    capabilities: ["Real-time weather data", "Multi-location support", "Alerts & warnings", "Email delivery"],
    exampleTask: "Send weather forecast for Mumbai every morning at 7 AM",
  },
  {
    id: "news-summarizer",
    name: "News Summarizer",
    description: "Aggregate and summarize daily news from multiple sources",
    icon: <Newspaper className="w-6 h-6" />,
    category: "Information",
    capabilities: ["News aggregation", "AI summarization", "Topic filtering", "Scheduled delivery"],
    exampleTask: "Summarize top 10 tech news stories daily at 6 PM",
  },
  {
    id: "task-reminder",
    name: "Task Reminder Agent",
    description: "Send automated reminders for tasks, meetings, and deadlines",
    icon: <Bell className="w-6 h-6" />,
    category: "Productivity",
    capabilities: ["Task scheduling", "Smart reminders", "Calendar integration", "Notification customization"],
    exampleTask: "Remind team about stand-up meeting 10 minutes before start",
  },
  {
    id: "social-monitor",
    name: "Social Media Monitor",
    description: "Monitor social media mentions and track brand sentiment",
    icon: <Share2 className="w-6 h-6" />,
    category: "Marketing",
    capabilities: ["Mention tracking", "Sentiment analysis", "Trend detection", "Report generation"],
    exampleTask: "Track brand mentions on Twitter and send weekly summary",
  },
  {
    id: "data-backup",
    name: "Data Backup Agent",
    description: "Automate regular backups of important data and files",
    icon: <Database className="w-6 h-6" />,
    category: "Automation",
    capabilities: ["Scheduled backups", "Multiple destinations", "Compression", "Verification"],
    exampleTask: "Backup database every night at 2 AM to cloud storage",
  },
];

interface CreateAgentDialogProps {
  trigger?: React.ReactNode;
  onAgentCreated?: (agent: { name: string; description: string; templateId?: string }) => void;
}

export function CreateAgentDialog({ trigger, onAgentCreated }: CreateAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const [agentName, setAgentName] = useState("");
  const [agentDescription, setAgentDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createAgentMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; templateId?: string }) => {
      return apiRequest("POST", "/api/agents", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
    },
  });

  const handleTemplateSelect = (template: AgentTemplate) => {
    setSelectedTemplate(template);
    setAgentName(template.name);
    setAgentDescription(template.description);
  };

  const handleCreateAgent = async () => {
    if (!agentName.trim()) {
      toast({
        title: "Name Required",
        description: "Please provide a name for your agent",
        variant: "destructive",
      });
      return;
    }

    const newAgent = {
      name: agentName,
      description: agentDescription || "Custom autonomous agent",
      templateId: selectedTemplate?.id,
    };

    try {
      await createAgentMutation.mutateAsync(newAgent);

      // Call the callback if provided
      if (onAgentCreated) {
        onAgentCreated(newAgent);
      }

      toast({
        title: "Agent Created!",
        description: `${agentName} has been created and is ready to execute tasks`,
      });

      // Reset and close
      setOpen(false);
      setSelectedTemplate(null);
      setAgentName("");
      setAgentDescription("");
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create agent. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-create-agent">
            <Plus className="w-4 h-4 mr-2" />
            Create Agent
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Agent
          </DialogTitle>
          <DialogDescription>
            Choose from pre-made templates or create a custom agent from scratch
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="templates" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Agent Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Agent</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agentTemplates.map((template) => (
                <Card
                  key={template.id}
                  className={`p-4 cursor-pointer transition-all hover-elevate ${
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5"
                      : ""
                  }`}
                  onClick={() => handleTemplateSelect(template)}
                  data-testid={`template-${template.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.capabilities.slice(0, 3).map((cap) => (
                          <Badge key={cap} variant="outline" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Example: {template.exampleTask}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {selectedTemplate && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="template-name">Agent Name</Label>
                  <Input
                    id="template-name"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Enter agent name"
                    data-testid="input-agent-name"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description (Optional)</Label>
                  <Textarea
                    id="template-description"
                    value={agentDescription}
                    onChange={(e) => setAgentDescription(e.target.value)}
                    placeholder="Customize the agent description"
                    rows={3}
                    data-testid="input-agent-description"
                  />
                </div>
                <Button 
                  onClick={handleCreateAgent} 
                  className="w-full" 
                  data-testid="button-create-from-template"
                  disabled={createAgentMutation.isPending}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {createAgentMutation.isPending ? "Creating..." : `Create ${selectedTemplate.name}`}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div>
              <Label htmlFor="custom-name">Agent Name</Label>
              <Input
                id="custom-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="e.g., Custom Data Processor"
                data-testid="input-custom-agent-name"
              />
            </div>
            <div>
              <Label htmlFor="custom-description">Description</Label>
              <Textarea
                id="custom-description"
                value={agentDescription}
                onChange={(e) => setAgentDescription(e.target.value)}
                placeholder="Describe what this agent will do..."
                rows={4}
                data-testid="input-custom-agent-description"
              />
            </div>
            <Button 
              onClick={handleCreateAgent} 
              className="w-full" 
              data-testid="button-create-custom-agent"
              disabled={createAgentMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              {createAgentMutation.isPending ? "Creating..." : "Create Custom Agent"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
