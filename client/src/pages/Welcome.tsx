import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Zap, Code, GraduationCap, Plane, Mail, Brain, Cpu, Lightbulb, Shield, Rocket, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Welcome() {
  const [statsVisible, setStatsVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Animate stats on mount
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLetsGo = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10 animate-gradient"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-32">
          <div className="text-center space-y-8">
            {/* Logo and Title with Animation */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-md blur-xl animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center shadow-lg">
                  <Bot className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                  Agentverse
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <Badge className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI-Powered
                  </Badge>
                  <Badge className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />
                    Secure
                  </Badge>
                  <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    <Rocket className="w-3 h-3 mr-1" />
                    Fast
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your intelligent autonomous agent platform with <span className="text-foreground font-semibold">memory</span>, 
              <span className="text-foreground font-semibold"> reasoning</span>, and 
              <span className="text-foreground font-semibold"> creativity</span>
            </p>

            {/* Stats Section */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto py-8 transition-all duration-1000 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <Card className="p-6 text-center bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border-purple-500/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">8+</div>
                <div className="text-sm text-muted-foreground">Agent Types</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border-blue-500/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent mb-2">10+</div>
                <div className="text-sm text-muted-foreground">Languages Supported</div>
              </Card>
              <Card className="p-6 text-center bg-gradient-to-br from-orange-500/10 to-red-500/10 backdrop-blur-sm border-orange-500/30">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">Autonomous Operation</div>
              </Card>
            </div>
            
            {/* Get Started Section */}
            <div className="flex flex-col items-center gap-4 pt-8">
              <Button
                size="lg"
                onClick={handleLetsGo}
                className="text-lg px-12 py-6 h-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-xl group"
                data-testid="button-get-started"
              >
                <Rocket className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                No signup required • Instant access • Free to use
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-8 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4">
              <Lightbulb className="w-3 h-3 mr-1" />
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Powerful AI Agents at Your Fingertips
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Agentverse provides specialized AI agents that work together seamlessly to handle your tasks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 space-y-4 hover-elevate group cursor-pointer transition-all duration-300 border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-500/5 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Brain className="w-7 h-7 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-purple-500 transition-colors">Unified AI Chat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Intelligent routing to specialized agents based on your intent
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover-elevate group cursor-pointer transition-all duration-300 border-green-500/20 hover:border-green-500/50 bg-gradient-to-br from-green-500/5 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/30 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Code className="w-7 h-7 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-green-500 transition-colors">Code Sandbox</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Execute code in multiple languages with real-time output
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover-elevate group cursor-pointer transition-all duration-300 border-blue-500/20 hover:border-blue-500/50 bg-gradient-to-br from-blue-500/5 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-7 h-7 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-500 transition-colors">Learning Assistant</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  AI-powered study schedules, quizzes, and email notifications
                </p>
              </div>
            </Card>

            <Card className="p-6 space-y-4 hover-elevate group cursor-pointer transition-all duration-300 border-orange-500/20 hover:border-orange-500/50 bg-gradient-to-br from-orange-500/5 to-transparent">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-500/30 rounded-md blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plane className="w-7 h-7 text-orange-500" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-orange-500 transition-colors">Travel Planner</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Indian-localized travel planning with direct booking links
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="py-24 px-8 bg-gradient-to-b from-card/30 to-background">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <Brain className="w-3 h-3 mr-1" />
              About Platform
            </Badge>
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Built for the Future
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of autonomous AI agents
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-8 space-y-4 hover-elevate border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-md flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Intelligent & Autonomous</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Agents with memory, reasoning engines, and LLM integration that break down complex tasks and learn from interactions.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-transparent">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 rounded-md flex items-center justify-center">
                <Zap className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Pre-Made Templates</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Instant access to production-ready agent templates for email, weather, news, reminders, and more.
                </p>
              </div>
            </Card>

            <Card className="p-8 space-y-4 hover-elevate border-rose-500/20 bg-gradient-to-br from-rose-500/5 to-transparent">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500/20 to-pink-500/20 rounded-md flex items-center justify-center">
                <Mail className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Real-Time Integration</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Secure code execution, project generation, travel planning, and scheduled notifications.
                </p>
              </div>
            </Card>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/50 py-12 px-8 bg-card/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-md flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold">Agentverse</span>
            </div>
            <div className="text-sm text-muted-foreground text-center">
              <p>&copy; 2025 Agentverse. Your intelligent autonomous agent platform.</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                <Cpu className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge className="text-xs bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0">
                <Zap className="w-3 h-3 mr-1" />
                Real-Time
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
