import { storage } from "../storage.js";
import { emailService } from "./emailService.js";
import { llmProvider } from "../llm/LLMProvider.js";
import type { Agent } from "../../shared/schema.js";

export interface AgentExecutionResult {
  success: boolean;
  message: string;
  data?: any;
}

export class AgentExecutor {
  async executeAgent(agentId: string, params?: any): Promise<AgentExecutionResult> {
    const agent = await storage.getAgent(agentId);
    
    if (!agent) {
      return {
        success: false,
        message: "Agent not found",
      };
    }

    await storage.updateAgentStatus(agentId, "executing", new Date());

    try {
      let result: AgentExecutionResult;

      switch (agent.templateId) {
        case "auto-email":
          result = await this.executeAutoEmailAgent(agent, params);
          break;

        case "weather-report":
          result = await this.executeWeatherReportAgent(agent, params);
          break;

        case "news-summarizer":
          result = await this.executeNewsSummarizerAgent(agent, params);
          break;

        case "task-reminder":
          result = await this.executeTaskReminderAgent(agent, params);
          break;

        case "social-monitor":
          result = await this.executeSocialMonitorAgent(agent, params);
          break;

        case "data-backup":
          result = await this.executeDataBackupAgent(agent, params);
          break;

        default:
          result = {
            success: false,
            message: `Unknown agent template: ${agent.templateId}`,
          };
      }

      const newTasksCompleted = agent.tasksCompleted + 1;
      const newSuccessRate = result.success
        ? Math.round(((agent.successRate * agent.tasksCompleted) + 100) / newTasksCompleted)
        : Math.round(((agent.successRate * agent.tasksCompleted)) / newTasksCompleted);

      await storage.updateAgentMetrics(agentId, newTasksCompleted, newSuccessRate);
      await storage.updateAgentStatus(agentId, result.success ? "idle" : "error");

      await storage.createAgentExecutionLog({
        agentId,
        status: result.success ? "success" : "error",
        message: result.message,
        result: result.data,
      });

      return result;
    } catch (error) {
      console.error("Agent execution error:", error);
      await storage.updateAgentStatus(agentId, "error");
      
      await storage.createAgentExecutionLog({
        agentId,
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error occurred",
        result: null,
      });

      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async executeAutoEmailAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    const { to, subject, body } = params || {};

    if (!to || !subject || !body) {
      return {
        success: false,
        message: "Missing required parameters: to, subject, body",
      };
    }

    try {
      const sent = await emailService.sendEmail(to, subject, body);

      if (sent) {
        return {
          success: true,
          message: `Email sent successfully to ${to}`,
          data: { to, subject },
        };
      } else {
        return {
          success: false,
          message: "Email service failed to send email",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async executeWeatherReportAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    const { location, apiKey } = params || {};

    if (!location) {
      return {
        success: false,
        message: "Missing required parameter: location",
      };
    }

    if (!apiKey) {
      return {
        success: false,
        message: "Missing required parameter: apiKey (OpenWeatherMap API key)",
      };
    }

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Weather API error: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: `Weather fetched successfully for ${location}`,
        data: {
          location: data.name,
          temperature: data.main.temp,
          feelsLike: data.main.feels_like,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch weather: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async executeNewsSummarizerAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    const { topic, country = "in", pageSize = 5, apiKey } = params || {};

    if (!topic) {
      return {
        success: false,
        message: "Missing required parameter: topic (e.g., 'technology', 'business', 'sports')",
      };
    }

    if (!apiKey) {
      return {
        success: false,
        message: "Missing required parameter: apiKey (News API key)",
      };
    }

    try {
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?q=${encodeURIComponent(topic)}&country=${country}&pageSize=${pageSize}&apiKey=${apiKey}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: `News API error: ${errorData.message || response.statusText}`,
        };
      }

      const data = await response.json();

      if (data.status === "error") {
        return {
          success: false,
          message: `News API error: ${data.message || 'Unknown error'}. Code: ${data.code || 'N/A'}`,
        };
      }

      const articles = data.articles || [];

      if (articles.length === 0) {
        return {
          success: false,
          message: `No news articles found for topic: ${topic}`,
        };
      }

      const structuredArticles = articles.map((article: any) => ({
        title: article.title || "Untitled",
        source: article.source?.name || "Unknown",
        url: article.url || null,
        publishedAt: article.publishedAt || null,
        description: article.description || null,
      }));

      const articlesText = structuredArticles
        .map((article: any, idx: number) => 
          `${idx + 1}. ${article.title}\n${article.description || ''}\nSource: ${article.source}\nPublished: ${article.publishedAt || 'Unknown'}`
        )
        .join('\n\n');

      const llmResponse = await llmProvider.chat([
        {
          role: "system",
          content: "You are a news summarizer. Create a concise, informative summary of the news articles provided. Focus on key facts and trends.",
        },
        {
          role: "user",
          content: `Summarize these ${articles.length} news articles about "${topic}":\n\n${articlesText}`,
        },
      ]);

      const uniqueSources = Array.from(new Set(structuredArticles.map((a: any) => a.source))).filter((s: any) => s !== "Unknown");

      return {
        success: true,
        message: `Successfully summarized ${articles.length} news articles about "${topic}"`,
        data: {
          topic,
          articlesCount: articles.length,
          summary: llmResponse.content,
          llmProvider: llmResponse.provider,
          articles: structuredArticles,
          sources: uniqueSources,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch and summarize news: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async executeTaskReminderAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    const { task, dueDate, reminderEmail, reminderTime = "09:00 UTC", timezone = "UTC" } = params || {};

    if (!task) {
      return {
        success: false,
        message: "Missing required parameter: task (description of what to remind)",
      };
    }

    if (!reminderEmail) {
      return {
        success: false,
        message: "Missing required parameter: reminderEmail (where to send reminder)",
      };
    }

    try {
      const reminderSubject = dueDate 
        ? `Task Reminder: ${task} (Due: ${dueDate})`
        : `Task Reminder: ${task}`;

      const reminderBody = `
Hello!

This is a reminder about your task:

TASK: ${task}
${dueDate ? `DUE DATE: ${dueDate}` : ''}
REMINDER TIME: ${reminderTime} (${timezone})

Don't forget to complete this task on time!

Best regards,
Your Agentverse Task Reminder Agent
      `.trim();

      const sent = await emailService.sendEmail(
        reminderEmail,
        reminderSubject,
        reminderBody
      );

      if (sent) {
        return {
          success: true,
          message: `Task reminder sent successfully to ${reminderEmail}`,
          data: {
            task,
            dueDate,
            reminderEmail,
            reminderTime,
            timezone,
            sentAt: new Date().toISOString(),
          },
        };
      } else {
        return {
          success: false,
          message: "Failed to send task reminder email",
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to send task reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  private async executeSocialMonitorAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    return {
      success: false,
      message: "Social Monitor agent not yet implemented. Coming soon!",
    };
  }

  private async executeDataBackupAgent(agent: Agent, params: any): Promise<AgentExecutionResult> {
    return {
      success: false,
      message: "Data Backup agent not yet implemented. Coming soon!",
    };
  }
}

export const agentExecutor = new AgentExecutor();
