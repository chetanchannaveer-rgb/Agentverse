import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Key, Cpu, Bell } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [apiKey, setApiKey] = useState("");
  const [autoExecute, setAutoExecute] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSave = () => {
    // TODO: Replace with actual API call to save settings
    console.log("Settings saved");
  };

  return (
    <div className="min-h-screen">
      <div className="py-12 px-8 border-b">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your Agentverse platform</p>
        </div>
      </div>

      <div className="py-8 px-8">
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="general" className="w-full">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="llm">LLM Provider</TabsTrigger>
              <TabsTrigger value="agents">Agent Defaults</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  System Configuration
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto-execute Generated Code</Label>
                      <p className="text-sm text-muted-foreground">Automatically run code in sandbox after generation</p>
                    </div>
                    <Switch 
                      checked={autoExecute} 
                      onCheckedChange={setAutoExecute}
                      data-testid="switch-auto-execute"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">System follows theme preference</p>
                    </div>
                    <p className="text-sm text-muted-foreground">Use toggle in header</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="llm" className="mt-6 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  LLM Provider Configuration
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="openai-key">OpenAI API Key</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Add your API key to enable GPT-4. Leave empty to use local simulator.
                    </p>
                    <Input
                      id="openai-key"
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      data-testid="input-api-key"
                    />
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Current Provider</p>
                    <p className="text-sm text-muted-foreground">
                      {apiKey ? "OpenAI GPT-4" : "Local LLM Simulator"}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-2">About Local Simulator</h3>
                <p className="text-sm text-muted-foreground">
                  The local LLM simulator uses deterministic templates with controlled randomness to mimic
                  agent behavior without requiring external API keys. It's perfect for testing and development,
                  but provides limited capabilities compared to real LLM providers.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="mt-6 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Default Agent Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-iterations">Max Task Iterations</Label>
                    <Input
                      id="max-iterations"
                      type="number"
                      defaultValue={10}
                      className="mt-2"
                      data-testid="input-max-iterations"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeout">Task Timeout (seconds)</Label>
                    <Input
                      id="timeout"
                      type="number"
                      defaultValue={30}
                      className="mt-2"
                      data-testid="input-timeout"
                    />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="mt-6 space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Enable Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive alerts for agent activities</p>
                    </div>
                    <Switch 
                      checked={notifications} 
                      onCheckedChange={setNotifications}
                      data-testid="switch-notifications"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Task Completion Alerts</Label>
                      <p className="text-sm text-muted-foreground">Notify when agents complete tasks</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Error Notifications</Label>
                      <p className="text-sm text-muted-foreground">Alert on agent execution errors</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} data-testid="button-save-settings">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
