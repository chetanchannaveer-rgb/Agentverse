import { llmProvider } from "../llm/LLMProvider";
import { projectGenerator } from "../services/ProjectGenerator";

interface CoordinatorResult {
  response: string;
  agentsUsed: string[];
  projectId?: string;
  projectData?: any;
}

class UnifiedAgentCoordinator {
  async handleMessage(message: string): Promise<CoordinatorResult> {
    const agentsUsed: string[] = [];
    let specialization = "";

    if (this.isProjectGenerationQuery(message)) {
      agentsUsed.push("Project Generator");
      
      try {
        const project = await projectGenerator.generateProject(message);
        const projectId = `proj-${Date.now()}`;
        
        return {
          response: `**Project Generated: ${project.name}**\n\n${project.description}\n\nI've created a complete project with the following files:\n${project.files.map(f => `- ${f.path}`).join('\n')}\n\nYou can download this project as a zip file using the download button.`,
          agentsUsed,
          projectId,
          projectData: project
        };
      } catch (error: any) {
        return {
          response: `I encountered an error generating your project: ${error.message}`,
          agentsUsed
        };
      }
    }

    if (this.isLearningQuery(message)) {
      agentsUsed.push("Learning Assistant");
      specialization += "You excel at educational content, breaking down complex topics, creating study plans, and generating quiz questions. ";
    }

    if (this.isBookingQuery(message)) {
      agentsUsed.push("Booking Navigator");
      specialization += "You specialize in travel and booking assistance, helping users find flights, hotels, restaurants, and events. ";
    }

    if (this.isCodeQuery(message)) {
      agentsUsed.push("Code Helper");
      specialization += "You are expert at programming, debugging, explaining code concepts, and providing code examples. ";
    }

    if (agentsUsed.length === 0) {
      agentsUsed.push("General Assistant");
      specialization = "You are a knowledgeable general assistant capable of answering any question. ";
    }

    const messages = [
      {
        role: "system" as const,
        content: `You are an intelligent AI assistant coordinating specialized capabilities: ${agentsUsed.join(", ")}.

${specialization}

CRITICAL INSTRUCTIONS:
1. Answer ALL questions directly and concisely
2. Keep responses under 120 words
3. Use proper formatting with these sections:
   - **Summary** (1-2 sentences)
   - **Key Points** (bulleted list, 3 items max)
   - **Recommended Action** (only when relevant)
4. Omit verbose explanations and internal reasoning
5. Focus only on essential information

Your goal is to provide clear, focused answers that deliver maximum value with minimal words.`
      },
      {
        role: "user" as const,
        content: message
      }
    ];

    const response = await llmProvider.chat(messages);

    return {
      response: response.content,
      agentsUsed
    };
  }

  private isLearningQuery(message: string): boolean {
    const learningKeywords = ["learn", "study", "quiz", "teach", "explain", "course", "lesson"];
    return learningKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isBookingQuery(message: string): boolean {
    const bookingKeywords = ["book", "reserve", "hotel", "flight", "restaurant", "travel"];
    return bookingKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isCodeQuery(message: string): boolean {
    const codeKeywords = ["code", "program", "debug", "function", "syntax", "error", "bug"];
    return codeKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  private isProjectGenerationQuery(message: string): boolean {
    const projectKeywords = ["create a project", "build a project", "generate a project", "make a project", "create project", "build project"];
    return projectKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }
}

export const unifiedCoordinator = new UnifiedAgentCoordinator();
