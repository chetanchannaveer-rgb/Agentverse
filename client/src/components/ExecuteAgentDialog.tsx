import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Play, Loader2, CheckCircle, XCircle } from "lucide-react";
import type { Agent } from "@shared/schema";

interface ExecuteAgentDialogProps {
  agent: Agent;
  trigger?: React.ReactNode;
}

interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
}

const autoEmailSchema = z.object({
  to: z.string().email("Invalid email address").min(1, "Recipient email is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Message body is required"),
});

const weatherReportSchema = z.object({
  location: z.string().min(1, "Location is required"),
  apiKey: z.string().min(1, "OpenWeatherMap API key is required"),
});

const newsSummarizerSchema = z.object({
  topic: z.string().min(1, "Topic is required"),
  country: z.string().optional(),
  apiKey: z.string().min(1, "News API key is required"),
});

const taskReminderSchema = z.object({
  task: z.string().min(1, "Task description is required"),
  reminderEmail: z.string().email("Invalid email address").min(1, "Email is required"),
  dueDate: z.string().optional(),
});

type FormSchema = z.infer<typeof autoEmailSchema> | 
  z.infer<typeof weatherReportSchema> | 
  z.infer<typeof newsSummarizerSchema> | 
  z.infer<typeof taskReminderSchema>;

function getSchemaForTemplate(templateId: string | null) {
  switch (templateId) {
    case "auto-email":
      return autoEmailSchema;
    case "weather-report":
      return weatherReportSchema;
    case "news-summarizer":
      return newsSummarizerSchema;
    case "task-reminder":
      return taskReminderSchema;
    default:
      return z.object({});
  }
}

function getDefaultValues(templateId: string | null): Record<string, string> {
  switch (templateId) {
    case "auto-email":
      return { to: "", subject: "", body: "" };
    case "weather-report":
      return { location: "", apiKey: "" };
    case "news-summarizer":
      return { topic: "", country: "in", apiKey: "" };
    case "task-reminder":
      return { task: "", reminderEmail: "", dueDate: "" };
    default:
      return {};
  }
}

export function ExecuteAgentDialog({ agent, trigger }: ExecuteAgentDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const { toast } = useToast();

  const schema = getSchemaForTemplate(agent.templateId);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(agent.templateId),
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      setResult(null);
    }
  }, [open, form]);

  const executeMutation = useMutation({
    mutationFn: async (executeParams: Record<string, string>) => {
      const response = await apiRequest("POST", `/api/agents/${agent.id}/execute`, executeParams);
      return await response.json() as ExecutionResult;
    },
    onSuccess: (data: ExecutionResult) => {
      setResult(data);
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Execution Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to execute agent",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    setResult(null);
    executeMutation.mutate(data);
  };

  const renderFormFields = () => {
    switch (agent.templateId) {
      case "auto-email":
        return (
          <>
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="recipient@example.com"
                      data-testid="input-email-to"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Email subject"
                      data-testid="input-email-subject"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Email message..."
                      className="min-h-[120px]"
                      data-testid="input-email-body"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "weather-report":
        return (
          <>
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="City name (e.g., Mumbai, Delhi, Bangalore)"
                      data-testid="input-weather-location"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a city name to get current weather data
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OpenWeatherMap API Key *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Get free at openweathermap.org/api"
                      data-testid="input-weather-apikey"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Free tier: 1,000 calls/day. Get your key at{" "}
                    <a
                      href="https://openweathermap.org/api"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      openweathermap.org/api
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "news-summarizer":
        return (
          <>
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., technology, business, sports"
                      data-testid="input-news-topic"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="in (India)"
                      data-testid="input-news-country"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Use 2-letter country code (default: in)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>News API Key *</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Get free at newsapi.org"
                      data-testid="input-news-apikey"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Free tier: 100 requests/day. Get your key at{" "}
                    <a
                      href="https://newsapi.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      newsapi.org
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case "task-reminder":
        return (
          <>
            <FormField
              control={form.control}
              name="task"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What should be reminded?"
                      data-testid="input-task-description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reminderEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="where to send reminder"
                      data-testid="input-reminder-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2024-12-25"
                      data-testid="input-due-date"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      default:
        return (
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              This agent template doesn't require any parameters.
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="default" data-testid="button-execute-agent">
            <Play className="w-4 h-4 mr-1" />
            Execute
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Execute Agent: {agent.name}</DialogTitle>
          <DialogDescription>
            {agent.description || "Provide the required information to run this agent"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            {renderFormFields()}

            {result && (
              <div
                className={`p-4 rounded-md border ${
                  result.success
                    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                }`}
                data-testid="execution-result"
              >
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{result.message}</p>
                    {result.data && (
                      <pre className="mt-2 text-xs bg-background/50 p-2 rounded overflow-auto max-h-[200px]">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                data-testid="button-cancel"
              >
                {result ? "Close" : "Cancel"}
              </Button>
              {!result && (
                <Button
                  type="submit"
                  disabled={executeMutation.isPending}
                  data-testid="button-run-agent"
                >
                  {executeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Agent
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
