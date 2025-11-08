import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityFeedItem from "@/components/ActivityFeedItem";
import { Search, Download } from "lucide-react";
import { useState } from "react";

export default function ActivityLogs() {
  const [searchQuery, setSearchQuery] = useState("");

  // TODO: Remove mock data - replace with real activity logs from backend
  const allLogs = [
    { title: "Agent Created", description: "New agent 'Code Generator' initialized with default capabilities", timestamp: "2m ago", type: "success" as const },
    { title: "Task Completed", description: "Successfully generated 3 React components with TypeScript", timestamp: "5m ago", type: "success" as const },
    { title: "Execution Error", description: "Failed to compile generated code due to syntax error in line 42", timestamp: "12m ago", type: "error" as const },
    { title: "System Update", description: "LLM provider switched from local simulator to OpenAI GPT-4", timestamp: "1h ago", type: "info" as const },
    { title: "Agent Paused", description: "User manually paused 'Data Analyst' agent", timestamp: "2h ago", type: "warning" as const },
    { title: "Task Started", description: "Agent 'Booking Assistant' started processing booking request", timestamp: "3h ago", type: "info" as const },
    { title: "Code Executed", description: "Successfully ran 15 lines of JavaScript in sandbox", timestamp: "4h ago", type: "success" as const },
    { title: "Timeout Warning", description: "Task execution approaching timeout limit (28/30 seconds)", timestamp: "5h ago", type: "warning" as const },
  ];

  const successLogs = allLogs.filter(log => log.type === "success");
  const errorLogs = allLogs.filter(log => log.type === "error");
  const warningLogs = allLogs.filter(log => log.type === "warning");

  return (
    <div className="min-h-screen">
      <div className="py-12 px-8 border-b">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Activity Logs</h1>
              <p className="text-muted-foreground">Monitor system events and agent activities</p>
            </div>
            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export Logs
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-logs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="py-8 px-8">
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Logs ({allLogs.length})</TabsTrigger>
              <TabsTrigger value="success">Success ({successLogs.length})</TabsTrigger>
              <TabsTrigger value="errors">Errors ({errorLogs.length})</TabsTrigger>
              <TabsTrigger value="warnings">Warnings ({warningLogs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <Card className="p-6">
                {allLogs.map((log, index) => (
                  <ActivityFeedItem
                    key={index}
                    {...log}
                    isLast={index === allLogs.length - 1}
                  />
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="success" className="mt-6">
              <Card className="p-6">
                {successLogs.map((log, index) => (
                  <ActivityFeedItem
                    key={index}
                    {...log}
                    isLast={index === successLogs.length - 1}
                  />
                ))}
              </Card>
            </TabsContent>

            <TabsContent value="errors" className="mt-6">
              <Card className="p-6">
                {errorLogs.length > 0 ? (
                  errorLogs.map((log, index) => (
                    <ActivityFeedItem
                      key={index}
                      {...log}
                      isLast={index === errorLogs.length - 1}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No errors recorded</p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="warnings" className="mt-6">
              <Card className="p-6">
                {warningLogs.length > 0 ? (
                  warningLogs.map((log, index) => (
                    <ActivityFeedItem
                      key={index}
                      {...log}
                      isLast={index === warningLogs.length - 1}
                    />
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No warnings recorded</p>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
