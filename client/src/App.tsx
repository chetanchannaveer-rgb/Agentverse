import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import ThemeToggle from "@/components/ThemeToggle";
import Welcome from "@/pages/Welcome";
import Dashboard from "@/pages/Dashboard";
import AgentChat from "@/pages/AgentChat";
import CodeSandbox from "@/pages/CodeSandbox";
import BookingNavigator from "@/pages/BookingNavigator";
import LearningAssistant from "@/pages/LearningAssistant";
import ActivityLogs from "@/pages/ActivityLogs";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function ProtectedRouter() {
  return (
    <Switch>
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/chat" component={AgentChat} />
      <Route path="/sandbox" component={CodeSandbox} />
      <Route path="/booking" component={BookingNavigator} />
      <Route path="/learning" component={LearningAssistant} />
      <Route path="/logs" component={ActivityLogs} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <Switch>
      <Route path="/" component={Welcome} />
      <Route>
        {(params) => (
          <SidebarProvider style={style as React.CSSProperties}>
            <div className="flex h-screen w-full">
              <AppSidebar />
              <div className="flex flex-col flex-1 overflow-hidden">
                <header className="flex items-center justify-between px-4 py-2 border-b bg-background sticky top-0 z-50">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </header>
                <main className="flex-1 overflow-auto">
                  <ProtectedRouter />
                </main>
              </div>
            </div>
          </SidebarProvider>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
