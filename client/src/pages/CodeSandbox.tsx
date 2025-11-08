import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, Trash2, FileCode, Copy, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import StatusBadge from "@/components/StatusBadge";
import type { CodeExecutionResult } from "@shared/schema";

const LANGUAGE_EXAMPLES = {
  javascript: `// JavaScript Example
console.log("Hello, World!");

// Calculate Fibonacci numbers
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  
  python: `# Python Example
print("Hello, World!")

# Calculate Fibonacci numbers
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
  
  typescript: `// TypeScript Example
console.log("Hello, World!");

// Calculate Fibonacci numbers
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
  
  bash: `#!/bin/bash
# Bash Example
echo "Hello, World!"

# Print system information
echo "Current directory: $(pwd)"
echo "Date: $(date)"
echo "User: $(whoami)"

# Simple loop
for i in {1..5}; do
  echo "Count: $i"
done`,

  c: `// C Example
#include <stdio.h>

// Calculate Fibonacci numbers
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    printf("Hello, World!\\n");
    
    // Calculate and print Fibonacci numbers
    for (int i = 0; i < 10; i++) {
        printf("F(%d) = %d\\n", i, fibonacci(i));
    }
    
    return 0;
}`,

  cpp: `// C++ Example
#include <iostream>
using namespace std;

// Calculate Fibonacci numbers
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Hello, World!" << endl;
    
    // Calculate and print Fibonacci numbers
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    
    return 0;
}`,
};

type Language = keyof typeof LANGUAGE_EXAMPLES;

export default function CodeSandbox() {
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState(LANGUAGE_EXAMPLES.javascript);
  const [output, setOutput] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const executeMutation = useMutation({
    mutationFn: async (payload: { code: string; language: string }) => {
      const response = await apiRequest("POST", "/api/code/execute", payload);
      return await response.json() as CodeExecutionResult;
    },
    onSuccess: (result) => {
      setExecutionTime(result.executionTime);
      
      if (result.success) {
        const outputLines = result.output.split("\n").filter(line => line.trim());
        setOutput(outputLines.length > 0 ? outputLines : ["Code executed successfully (no output)"]);
        setErrors([]);
        
        toast({
          title: "Execution successful",
          description: `Completed in ${result.executionTime}ms`,
        });
      } else {
        setOutput([]);
        setErrors([result.error || "Unknown error occurred"]);
        
        toast({
          title: "Execution failed",
          description: result.error,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      setOutput([]);
      setErrors([error.message || "Failed to execute code"]);
      
      toast({
        title: "Execution failed",
        description: "An error occurred while executing the code",
        variant: "destructive",
      });
    },
  });

  const handleRun = () => {
    if (!code.trim()) {
      toast({
        title: "No code to execute",
        description: "Please write some code first",
        variant: "destructive",
      });
      return;
    }
    
    setOutput([]);
    setErrors([]);
    executeMutation.mutate({ code, language });
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCode(LANGUAGE_EXAMPLES[newLanguage]);
    setOutput([]);
    setErrors([]);
  };

  const handleClear = () => {
    setCode("");
    setOutput([]);
    setErrors([]);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Code has been copied to your clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileExtension = () => {
    const extensions: Record<Language, string> = {
      javascript: "js",
      python: "py",
      typescript: "ts",
      bash: "sh",
      c: "c",
      cpp: "cpp",
    };
    return extensions[language];
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Code Sandbox</h1>
          <p className="text-sm text-muted-foreground">Write and execute code in multiple languages</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40" data-testid="select-language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          <StatusBadge status={executeMutation.isPending ? "executing" : "idle"} />
          {executeMutation.isPending ? (
            <Button variant="destructive" disabled data-testid="button-stop">
              <Square className="w-4 h-4 mr-2" />
              Executing...
            </Button>
          ) : (
            <Button onClick={handleRun} data-testid="button-run">
              <Play className="w-4 h-4 mr-2" />
              Run Code
            </Button>
          )}
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 grid grid-cols-2 divide-x">
        {/* Editor Panel */}
        <div className="flex flex-col">
          <div className="p-4 border-b flex items-center justify-between bg-card/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4" />
              <span className="text-sm font-medium font-mono">script.{getFileExtension()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleCopy} data-testid="button-copy">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleClear} data-testid="button-clear">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <Textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[600px] font-mono text-sm resize-none border-0 focus-visible:ring-0"
                placeholder="Write your code here..."
                data-testid="textarea-code"
              />
            </div>
          </ScrollArea>
          <div className="p-2 border-t bg-card/50 flex items-center justify-between text-xs text-muted-foreground font-mono">
            <span>{language}</span>
            <span>{code.split("\n").length} lines</span>
          </div>
        </div>

        {/* Console Output Panel */}
        <div className="flex flex-col bg-card/50">
          <Tabs defaultValue="console" className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger value="console" className="rounded-none" data-testid="tab-console">
                Console
              </TabsTrigger>
              <TabsTrigger value="errors" className="rounded-none" data-testid="tab-errors">
                Errors {errors.length > 0 && `(${errors.length})`}
              </TabsTrigger>
              <TabsTrigger value="performance" className="rounded-none" data-testid="tab-performance">
                Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm space-y-1">
                  {output.length === 0 ? (
                    <p className="text-muted-foreground">Console output will appear here...</p>
                  ) : (
                    output.map((line, index) => (
                      <div key={index} className="py-0.5" data-testid={`output-line-${index}`}>
                        <span className="text-muted-foreground mr-2">{index + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="errors" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 font-mono text-sm">
                  {errors.length === 0 ? (
                    <p className="text-muted-foreground">No errors detected</p>
                  ) : (
                    <div className="space-y-2">
                      {errors.map((error, index) => (
                        <div key={index} className="text-destructive" data-testid={`error-line-${index}`}>
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="performance" className="flex-1 m-0">
              <div className="p-4 space-y-4">
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Execution Time</p>
                  <p className="text-2xl font-bold" data-testid="text-execution-time">
                    {executionTime > 0 ? `${executionTime}ms` : "-"}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Language</p>
                  <p className="text-2xl font-bold capitalize">{language}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-sm text-muted-foreground mb-1">Lines of Code</p>
                  <p className="text-2xl font-bold">{code.split("\n").length}</p>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
