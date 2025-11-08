interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatResponse {
  content: string;
  provider: string;
}

class LLMProvider {
  private provider: string;

  constructor() {
    this.provider = this.detectProvider();
  }

  private detectProvider(): string {
    if (process.env.GEMINI_API_KEY) {
      return "gemini";
    }
    if (process.env.OPENAI_API_KEY) {
      return "openai";
    }
    if (process.env.ANTHROPIC_API_KEY) {
      return "anthropic";
    }
    return "mock";
  }

  getProvider(): string {
    return this.provider;
  }

  isRealLLMAvailable(): boolean {
    return this.provider !== "mock";
  }

  async chat(messages: Message[]): Promise<ChatResponse> {
    if (this.provider === "gemini" && process.env.GEMINI_API_KEY) {
      return this.chatWithGemini(messages);
    }
    
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      return this.chatWithOpenAI(messages);
    }
    
    if (this.provider === "anthropic" && process.env.ANTHROPIC_API_KEY) {
      return this.chatWithAnthropic(messages);
    }

    return this.mockChat(messages);
  }

  private async chatWithGemini(messages: Message[]): Promise<ChatResponse> {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const systemMessage = messages.find(m => m.role === "system")?.content || "";
      const userMessages = messages.filter(m => m.role !== "system");

      const enhancedSystemPrompt = systemMessage + "\n\nIMPORTANT: Provide only the essential answer in under 120 words. Format your response in three sections:\n1. **Summary** (1-2 sentences)\n2. **Key Points** (bullet list, 3 items or fewer)\n3. **Recommended Action** (optional, only when relevant)\n\nOmit internal reasoning and verbose explanations. Be concise and focused.";

      const chatHistory = userMessages.slice(0, -1).map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }]
      }));

      const chat = model.startChat({
        history: chatHistory,
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 1024,
        },
      });

      const lastUserMessage = userMessages[userMessages.length - 1]?.content || "";
      const fullPrompt = chatHistory.length === 0 
        ? `${enhancedSystemPrompt}\n\nUser: ${lastUserMessage}`
        : lastUserMessage;

      const result = await chat.sendMessage(fullPrompt);
      const response = result.response;
      
      return {
        content: response.text(),
        provider: "gemini"
      };
    } catch (error) {
      console.error("Gemini error:", error);
      return this.mockChat(messages);
    }
  }

  private async chatWithOpenAI(messages: Message[]): Promise<ChatResponse> {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // Enhance system message for concise responses
      const enhancedMessages = messages.map(msg => {
        if (msg.role === "system") {
          return {
            ...msg,
            content: msg.content + "\n\nIMPORTANT: Provide only the essential answer in under 120 words. Format your response in three sections:\n1. **Summary** (1-2 sentences)\n2. **Key Points** (bullet list, 3 items or fewer)\n3. **Recommended Action** (optional, only when relevant)\n\nOmit internal reasoning and verbose explanations. Be concise and focused."
          };
        }
        return msg;
      });
      
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: enhancedMessages,
        temperature: 0.5,
        max_tokens: 1024,
      });

      return {
        content: response.choices[0]?.message?.content || "No response",
        provider: "openai"
      };
    } catch (error) {
      console.error("OpenAI error:", error);
      return this.mockChat(messages);
    }
  }

  private async chatWithAnthropic(messages: Message[]): Promise<ChatResponse> {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      let systemMessage = messages.find(m => m.role === "system")?.content || "";
      systemMessage += "\n\nIMPORTANT: Provide only the essential answer in under 120 words. Format your response in three sections:\n1. **Summary** (1-2 sentences)\n2. **Key Points** (bullet list, 3 items or fewer)\n3. **Recommended Action** (optional, only when relevant)\n\nOmit internal reasoning and verbose explanations. Be concise and focused.";
      
      const userMessages = messages.filter(m => m.role !== "system");

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        temperature: 0.5,
        system: systemMessage,
        messages: userMessages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }))
      });

      const content = response.content[0];
      return {
        content: content.type === "text" ? content.text : "No response",
        provider: "anthropic"
      };
    } catch (error) {
      console.error("Anthropic error:", error);
      return this.mockChat(messages);
    }
  }

  async generateQuiz(topic: string, goals?: string): Promise<ChatResponse> {
    if (this.provider === "gemini" && process.env.GEMINI_API_KEY) {
      return this.generateQuizWithGemini(topic, goals);
    }
    
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      return this.generateQuizWithOpenAI(topic, goals);
    }
    
    return this.mockQuiz(topic);
  }

  async generateSchedule(topic: string, duration: string, goals?: string): Promise<ChatResponse> {
    if (this.provider === "gemini" && process.env.GEMINI_API_KEY) {
      return this.generateScheduleWithGemini(topic, duration, goals);
    }
    
    if (this.provider === "openai" && process.env.OPENAI_API_KEY) {
      return this.generateScheduleWithOpenAI(topic, duration, goals);
    }
    
    return this.mockSchedule(topic, duration);
  }

  private async generateQuizWithGemini(topic: string, goals?: string): Promise<ChatResponse> {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const timestamp = Date.now();
      const prompt = `Generate 3 unique, educational multiple-choice quiz questions about "${topic}". ${goals ? `Focus on: ${goals}. ` : ""}

Generate DIFFERENT questions each time - avoid common questions. Include variety in difficulty and topics.

Timestamp for uniqueness: ${timestamp}

Return ONLY valid JSON in this exact format (no markdown, no backticks, no extra text):
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this is correct"
    }
  ]
}

Rules:
- correctAnswer is the index (0-3) of the correct option
- Each question must be different and educational
- Make questions practical and relevant
- Vary the difficulty level`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();
      
      let cleanedText = text;
      if (text.startsWith('```json')) {
        cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (text.startsWith('```')) {
        cleanedText = text.replace(/```\n?/g, '').trim();
      }
      
      return {
        content: cleanedText,
        provider: "gemini"
      };
    } catch (error) {
      console.error("Gemini quiz generation error:", error);
      return this.mockQuiz(topic);
    }
  }

  private async generateQuizWithOpenAI(topic: string, goals?: string): Promise<ChatResponse> {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const timestamp = Date.now();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a quiz generator. Generate educational quiz questions in JSON format. Return ONLY valid JSON, no markdown code blocks, no extra text."
          },
          {
            role: "user",
            content: `Generate 3 unique multiple-choice quiz questions about "${topic}". ${goals ? `Focus on: ${goals}. ` : ""}Timestamp: ${timestamp}. Return valid JSON with format: {"questions": [{"question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": 0, "explanation": "..."}]}`
          }
        ],
        temperature: 0.8,
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "{}";
      
      // Clean markdown code blocks if present
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '').trim();
      }

      return {
        content: cleanedText,
        provider: "openai"
      };
    } catch (error) {
      console.error("OpenAI quiz generation error:", error);
      return this.mockQuiz(topic);
    }
  }

  private mockQuiz(topic: string): ChatResponse {
    return {
      content: JSON.stringify({
        questions: [
          {
            question: `What is a key concept in ${topic}?`,
            options: [
              "Mock answer A (configure GEMINI_API_KEY for real questions)",
              "Mock answer B",
              "Mock answer C",
              "Mock answer D"
            ],
            correctAnswer: 0,
            explanation: "This is a mock quiz. Add GEMINI_API_KEY or OPENAI_API_KEY environment variable to generate real educational quizzes."
          }
        ]
      }),
      provider: "mock"
    };
  }

  private async generateScheduleWithGemini(topic: string, duration: string, goals?: string): Promise<ChatResponse> {
    try {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const timestamp = Date.now();
      const prompt = `Create a personalized study schedule for learning "${topic}" over ${duration}. ${goals ? `Learning goals: ${goals}. ` : ""}

Analyze the topic complexity and create a realistic day-by-day learning plan.

Timestamp for uniqueness: ${timestamp}

Return ONLY valid JSON in this exact format (no markdown, no backticks, no extra text):
{
  "topic": "${topic}",
  "totalDuration": "${duration}",
  "estimatedHoursPerDay": 2,
  "schedule": [
    {
      "day": 1,
      "title": "Introduction and Fundamentals",
      "duration": "2 hours",
      "topics": ["Topic 1", "Topic 2"],
      "description": "Detailed description of what to learn and practice",
      "completed": false
    }
  ],
  "tips": ["Helpful tip 1", "Helpful tip 2"]
}

Rules:
- Break down the learning journey into daily chunks
- Each day should have realistic hours (1-3 hours per day)
- Progress from fundamentals to advanced topics
- Include practical exercises and projects
- Provide 3-5 helpful study tips
- Make the schedule achievable and motivating`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text().trim();
      
      let cleanedText = text;
      if (text.startsWith('```json')) {
        cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (text.startsWith('```')) {
        cleanedText = text.replace(/```\n?/g, '').trim();
      }
      
      return {
        content: cleanedText,
        provider: "gemini"
      };
    } catch (error) {
      console.error("Gemini schedule generation error:", error);
      return this.mockSchedule(topic, duration);
    }
  }

  private async generateScheduleWithOpenAI(topic: string, duration: string, goals?: string): Promise<ChatResponse> {
    try {
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const timestamp = Date.now();
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a study schedule planner. Create personalized learning schedules in JSON format. Return ONLY valid JSON, no markdown code blocks, no extra text."
          },
          {
            role: "user",
            content: `Create a study schedule for "${topic}" over ${duration}. ${goals ? `Goals: ${goals}. ` : ""}Timestamp: ${timestamp}. Return valid JSON with format: {"topic": "...", "totalDuration": "...", "estimatedHoursPerDay": 2, "schedule": [{"day": 1, "title": "...", "duration": "...", "topics": ["..."], "description": "...", "completed": false}], "tips": ["..."]}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2048,
      });

      const text = response.choices[0]?.message?.content || "{}";
      
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '').trim();
      }

      return {
        content: cleanedText,
        provider: "openai"
      };
    } catch (error) {
      console.error("OpenAI schedule generation error:", error);
      return this.mockSchedule(topic, duration);
    }
  }

  private mockSchedule(topic: string, duration: string): ChatResponse {
    return {
      content: JSON.stringify({
        topic: topic,
        totalDuration: duration,
        estimatedHoursPerDay: 2,
        schedule: [
          {
            day: 1,
            title: "Getting Started",
            duration: "2 hours",
            topics: ["Introduction", "Basic Concepts"],
            description: "This is a mock schedule. Add GEMINI_API_KEY or OPENAI_API_KEY to generate personalized AI-powered study schedules.",
            completed: false
          }
        ],
        tips: [
          "Configure GEMINI_API_KEY for AI-generated schedules",
          "Set realistic daily study goals",
          "Take breaks between study sessions"
        ]
      }),
      provider: "mock"
    };
  }

  private async mockChat(messages: Message[]): Promise<ChatResponse> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    const response = `**Summary**
Running in mock mode (no LLM API configured). Limited responses available.

**Key Points**
• Configure GEMINI_API_KEY for Google Gemini 2.0
• Configure OPENAI_API_KEY for GPT-3.5 access
• Configure ANTHROPIC_API_KEY for Claude access

**Recommended Action**
Add an API key to environment variables for intelligent AI responses.`;
    
    return {
      content: response,
      provider: "mock"
    };
  }
}

export const llmProvider = new LLMProvider();
