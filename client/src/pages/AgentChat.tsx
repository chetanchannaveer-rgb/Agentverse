import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatMessage from "@/components/ChatMessage";
import StatusBadge from "@/components/StatusBadge";
import { Send, Trash2, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "agent" | "user";
  content: string;
  timestamp: string;
  agentName?: string;
  provider?: string;
};

export default function AgentChat() {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "agent" as const, 
      content: "Hello! I'm your AI assistant. Ask me anything and I'll provide clear, concise answers with key points and actionable recommendations.", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      agentName: "AI Assistant",
      provider: "system"
    },
  ]);
  const [llmProvider, setLlmProvider] = useState<string>("unknown");
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch LLM provider status
    fetch("/api/system/llm-provider")
      .then(res => res.json())
      .then(data => {
        setLlmProvider(data.provider);
      })
      .catch(err => console.error("Failed to fetch LLM provider:", err));

    // Set up WebSocket connection with retry logic
    let reconnectTimeout: NodeJS.Timeout;
    let hasShownError = false;
    
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      
      ws.onopen = () => {
        console.log("WebSocket connected for agent chat");
        hasShownError = false;
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "unified_response") {
          setIsTyping(false);
          setMessages(prev => [...prev, {
            role: "agent" as const,
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            agentName: "AI Assistant",
            provider: llmProvider
          }]);
        }
      };
      
      ws.onerror = () => {
        // Silently handle errors - will fallback to REST API
        console.log("WebSocket connection issue - will use REST API fallback");
      };
      
      ws.onclose = () => {
        console.log("WebSocket disconnected");
        // Don't auto-reconnect - let REST API handle requests
      };
      
      wsRef.current = ws;
    };
    
    connectWebSocket();
    
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [llmProvider]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { 
      role: "user" as const, 
      content: message, 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);
    
    // Try WebSocket first
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "unified_chat",
        message: message
      }));
    } else {
      // Fallback to REST API
      try {
        const response = await fetch("/api/chat/unified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        
        const data = await response.json();
        setIsTyping(false);
        
        setMessages(prev => [...prev, {
          role: "agent" as const,
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: "AI Assistant",
          provider: llmProvider
        }]);
      } catch (error) {
        setIsTyping(false);
        toast({
          title: "Error",
          description: "Failed to get response from agent",
          variant: "destructive",
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([{
      role: "agent" as const, 
      content: "Conversation cleared. How can I help you?", 
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      agentName: "AI Assistant",
      provider: llmProvider
    }]);
  };

  return (
    <div className="h-screen flex">
      {/* Chat Thread */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Agent Chat</h1>
              <p className="text-sm text-muted-foreground">Ask any question and get concise, focused answers</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Bot className="w-3 h-3" />
                {llmProvider === "gemini" && "Google Gemini"}
                {llmProvider === "openai" && "OpenAI"}
                {llmProvider === "anthropic" && "Anthropic"}
                {llmProvider === "mock" && "Mock Mode"}
              </Badge>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {messages.map((msg, index) => (
              <ChatMessage key={index} {...msg} />
            ))}
            {isTyping && (
              <div className="flex gap-3 mb-4">
                <div className="flex items-center gap-1 bg-card border rounded-lg px-4 py-3">
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        <div className="p-6 border-t">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Textarea
              placeholder="Ask any question... (Shift+Enter for new line)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="resize-none min-h-[60px]"
              data-testid="input-message"
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleSend} disabled={isTyping} data-testid="button-send">
                <Send className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={handleClear}
                data-testid="button-clear"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Context Panel */}
      <div className="w-80 border-l p-6 bg-card/50">
        <h2 className="text-lg font-semibold mb-4">Agent Context</h2>
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">AI Assistant</h3>
            <StatusBadge status="active" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Current Mode</p>
          <p className="text-sm">
            {llmProvider === "mock" 
              ? "Running in mock mode with intelligent fallback responses" 
              : llmProvider === "gemini"
              ? "Powered by Google Gemini 2.0"
              : llmProvider === "openai"
              ? "Powered by OpenAI GPT-3.5"
              : "Powered by Anthropic Claude"}
          </p>
        </Card>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 text-sm">Capabilities</h3>
            <div className="space-y-1">
              {[
                "Answer any question", 
                "Provide concise, focused answers", 
                "Explain complex topics clearly",
                "Give key points & recommendations",
                "Analyze problems efficiently",
                "Deliver maximum value, minimal words"
              ].map((cap) => (
                <div key={cap} className="text-sm text-muted-foreground flex items-center gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full" />
                  {cap}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-2 text-sm">Conversation Stats</h3>
            <p className="text-sm text-muted-foreground">
              Messages: {messages.length}<br />
              User queries: {messages.filter(m => m.role === "user").length}<br />
              Responses: {messages.filter(m => m.role === "agent").length}
            </p>
          </div>

          {llmProvider === "mock" && (
            <Card className="p-3 border-amber-500/50 bg-amber-500/10">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                💡 Add Gemini, OpenAI, or Anthropic API keys for enhanced AI responses
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
