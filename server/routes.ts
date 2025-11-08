import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { agentManager } from "./agents/AgentManager.js";
import { llmProvider } from "./llm/LLMProvider.js";
import { unifiedCoordinator } from "./agents/UnifiedAgentCoordinator.js";
import { studyScheduleSchema, studyScheduleWithEmailSchema } from "../shared/schema.js";
import { storage } from "./storage.js";
import { scheduleEmailer } from "./services/scheduleEmailer.js";
import { emailService } from "./services/emailService.js";
import { projectGenerator } from "./services/ProjectGenerator.js";
import { agentExecutor } from "./services/AgentExecutor.js";
import { passport } from "./auth.js";
import { sessionMiddleware } from "./index.js";
import archiver from "archiver";

// Auth middleware - DISABLED for open access
function isAuthenticated(req: any, res: any, next: any) {
  // Allow all requests without authentication
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Authentication routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { scope: ["profile", "email"] })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/?error=auth_failed",
      failureMessage: true 
    }),
    (req, res) => {
      res.redirect("/dashboard");
    }
  );

  // Debug endpoint to show OAuth config
  app.get("/api/auth/debug", (req, res) => {
    const callbackURL = process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}/api/auth/google/callback`
      : "http://localhost:5000/api/auth/google/callback";
    
    res.json({
      message: "Add this URL to Google Cloud Console",
      callbackURL,
      origin: `https://${process.env.REPLIT_DEV_DOMAIN}`,
      hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
    });
  });

  // Development login bypass (temporary solution)
  app.post("/api/auth/dev-login", async (req, res) => {
    try {
      const { email, name } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email required" });
      }

      // Check if user exists by email
      let user = await storage.getUserByEmail?.(email);

      if (!user) {
        // Create new dev user
        user = await storage.createUser({
          email,
          name: name || email.split("@")[0],
          googleId: `dev_${Date.now()}`,
          picture: null,
        });
      }

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        res.json({ success: true, user });
      });
    } catch (error) {
      console.error("Dev login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/auth/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // WebSocket setup for real-time agent updates
  const wss = new WebSocketServer({ noServer: true });

  // Handle WebSocket upgrade - OPEN ACCESS (no authentication required)
  httpServer.on("upgrade", (request, socket, head) => {
    if (request.url !== "/ws") {
      socket.destroy();
      return;
    }

    // Allow all WebSocket connections
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  wss.on("connection", (ws, req: any) => {
    console.log("WebSocket client connected (authenticated)");
    
    ws.on("message", async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.type === "agent_chat") {
          const response = await agentManager.chatWithAgent(data.agentId, data.message);
          ws.send(JSON.stringify({ type: "agent_response", content: response }));
        } else if (data.type === "unified_chat") {
          const result = await unifiedCoordinator.handleMessage(data.message);
          
          if (result.projectId && result.projectData) {
            if (!storage.generatedProjects) {
              storage.generatedProjects = new Map();
            }
            storage.generatedProjects.set(result.projectId, result.projectData);
          }
          
          ws.send(JSON.stringify({ 
            type: "unified_response", 
            content: result.response,
            agentsUsed: result.agentsUsed,
            projectId: result.projectId,
            projectData: result.projectData
          }));
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  // Get all agents from database
  app.get("/api/agents", isAuthenticated, async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
      res.status(500).json({ error: "Failed to fetch agents" });
    }
  });

  // Create new agent with template support
  app.post("/api/agents", isAuthenticated, async (req, res) => {
    try {
      const { name, description, templateId, configuration } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Agent name is required" });
      }

      const agent = await storage.createAgent({
        name,
        description: description || null,
        templateId: templateId || null,
        configuration: configuration || null,
        status: "idle",
      });

      res.json(agent);
    } catch (error) {
      console.error("Agent creation error:", error);
      res.status(500).json({ error: "Failed to create agent" });
    }
  });

  // Get all agents from database
  app.get("/api/agents/db", isAuthenticated, async (req, res) => {
    try {
      const agents = await storage.getAllAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agents from database" });
    }
  });

  // Execute agent by ID with parameters
  app.post("/api/agents/:id/execute", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const params = req.body;

      const result = await agentExecutor.executeAgent(id, params);
      res.json(result);
    } catch (error) {
      console.error("Agent execution error:", error);
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Failed to execute agent" 
      });
    }
  });

  // Delete agent
  app.delete("/api/agents/:id", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAgent(id);

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete agent" });
    }
  });

  // Execute task with agent
  app.post("/api/agents/:id/task", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { task } = req.body;

      if (!task) {
        return res.status(400).json({ error: "Task description is required" });
      }

      const result = await agentManager.executeTask(id, task);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to execute task" });
    }
  });

  // Chat with agent
  app.post("/api/agents/:id/chat", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await agentManager.chatWithAgent(id, message);
      res.json({ response, provider: llmProvider.getProvider() });
    } catch (error) {
      res.status(500).json({ error: "Failed to chat with agent" });
    }
  });

  // Get LLM provider status
  app.get("/api/system/llm-provider", isAuthenticated, async (req, res) => {
    try {
      res.json({
        provider: llmProvider.getProvider(),
        hasRealLLM: llmProvider.isRealLLMAvailable()
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get provider status" });
    }
  });

  // Generate quiz (for learning assistant)
  app.post("/api/learning/generate-quiz", isAuthenticated, async (req, res) => {
    try {
      const { topic, goals } = req.body;

      if (!topic) {
        return res.status(400).json({ error: "Topic is required" });
      }

      // Use LLM to generate quiz with dedicated method
      const response = await llmProvider.generateQuiz(topic, goals);
      
      // Parse the JSON response
      let quizData;
      try {
        quizData = JSON.parse(response.content);
      } catch (parseError) {
        console.error("Failed to parse quiz JSON:", response.content);
        return res.status(500).json({ error: "Failed to parse quiz data" });
      }

      if (!quizData.questions || !Array.isArray(quizData.questions)) {
        return res.status(500).json({ error: "Invalid quiz format" });
      }

      res.json({ 
        questions: quizData.questions,
        provider: response.provider 
      });
    } catch (error) {
      console.error("Quiz generation error:", error);
      res.status(500).json({ error: "Failed to generate quiz" });
    }
  });

  // Generate study schedule (for learning assistant)
  app.post("/api/learning/generate-schedule", isAuthenticated, async (req, res) => {
    try {
      const { topic, duration, goals, studentEmail } = req.body;

      if (!topic || !duration) {
        return res.status(400).json({ error: "Topic and duration are required" });
      }

      // Use LLM to generate study schedule
      const response = await llmProvider.generateSchedule(topic, duration, goals);
      
      // Parse the JSON response
      let scheduleData;
      try {
        scheduleData = JSON.parse(response.content);
      } catch (parseError) {
        console.error("Failed to parse schedule JSON:", response.content);
        return res.status(500).json({ error: "Failed to parse schedule data" });
      }

      // Validate the schedule data against Zod schema
      let validatedSchedule;
      try {
        validatedSchedule = studyScheduleSchema.parse(scheduleData);
      } catch (validationError) {
        console.error("Schedule validation error:", validationError);
        return res.status(500).json({ error: "Invalid schedule structure from AI" });
      }

      // If email provided, save to storage and enable notifications
      let savedSchedule = null;
      if (studentEmail) {
        try {
          const scheduleWithEmail = studyScheduleWithEmailSchema.parse({
            ...validatedSchedule,
            studentEmail,
            emailNotificationsEnabled: true,
          });
          savedSchedule = await storage.saveStudySchedule(scheduleWithEmail);
          console.log(`📧 Schedule saved with email notifications for ${studentEmail}`);
          
          // Send immediate welcome email
          const emailSent = await emailService.sendWelcomeEmail(savedSchedule);
          if (emailSent) {
            console.log(`✅ Welcome email sent to ${studentEmail}`);
          } else {
            console.log(`⚠️ Welcome email could not be sent to ${studentEmail}`);
          }
        } catch (emailError) {
          console.error("Failed to save schedule with email:", emailError);
        }
      }

      res.json({ 
        schedule: validatedSchedule,
        scheduleId: savedSchedule?.id,
        emailNotificationsEnabled: !!savedSchedule,
        provider: response.provider 
      });
    } catch (error) {
      console.error("Schedule generation error:", error);
      res.status(500).json({ error: "Failed to generate schedule" });
    }
  });

  // Test email endpoint (for debugging)
  app.post("/api/learning/test-email/:scheduleId", isAuthenticated, async (req, res) => {
    try {
      const { scheduleId } = req.params;
      const sent = await scheduleEmailer.sendTestEmail(scheduleId);
      res.json({ success: sent });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get email scheduler status
  app.get("/api/learning/email-status", isAuthenticated, async (req, res) => {
    try {
      const status = scheduleEmailer.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get email status" });
    }
  });

  // Detect booking intent
  app.post("/api/booking/detect-intent", isAuthenticated, async (req, res) => {
    try {
      const { query, budget, destination, dates } = req.body;

      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      // Use LLM to detect intent
      const messages = [
        {
          role: "system" as const,
          content: "You are a travel booking assistant. Analyze user requests and determine what they want to book."
        },
        {
          role: "user" as const,
          content: `Analyze this booking request:\n${query}\n${budget ? `Budget: ${budget}` : ""}\n${destination ? `Destination: ${destination}` : ""}\n${dates ? `Dates: ${dates}` : ""}\n\nWhat is the user trying to book? (flights, hotels, packages, restaurants, events)`
        }
      ];

      const response = await llmProvider.chat(messages);
      res.json({ intent: response.content, provider: response.provider });
    } catch (error) {
      res.status(500).json({ error: "Failed to detect intent" });
    }
  });

  // Unified chat endpoint (REST fallback)
  app.post("/api/chat/unified", isAuthenticated, async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const result = await unifiedCoordinator.handleMessage(message);
      res.json(result);
    } catch (error) {
      console.error("Unified chat error:", error);
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Code execution endpoint
  app.post("/api/code/execute", isAuthenticated, async (req, res) => {
    try {
      const { code, language } = req.body;

      if (!code || !language) {
        return res.status(400).json({ error: "Code and language are required" });
      }

      const startTime = Date.now();
      let output = "";
      let error = "";
      let success = true;

      try {
        const { exec } = await import("child_process");
        const { promisify } = await import("util");
        const execAsync = promisify(exec);
        const fs = await import("fs/promises");
        const path = await import("path");
        const os = await import("os");

        // Create temporary directory for code execution
        const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "code-sandbox-"));
        
        let command = "";
        let filename = "";

        switch (language) {
          case "javascript":
            filename = path.join(tmpDir, "script.js");
            await fs.writeFile(filename, code);
            command = `node "${filename}"`;
            break;
          
          case "typescript":
            filename = path.join(tmpDir, "script.ts");
            await fs.writeFile(filename, code);
            command = `npx tsx "${filename}"`;
            break;
          
          case "python":
            filename = path.join(tmpDir, "script.py");
            await fs.writeFile(filename, code);
            command = `python3 "${filename}"`;
            break;
          
          case "bash":
            filename = path.join(tmpDir, "script.sh");
            await fs.writeFile(filename, code);
            await fs.chmod(filename, 0o755);
            command = `bash "${filename}"`;
            break;
          
          case "c":
            const cSourceFile = path.join(tmpDir, "program.c");
            const cExecutable = path.join(tmpDir, "program");
            await fs.writeFile(cSourceFile, code);
            command = `gcc "${cSourceFile}" -o "${cExecutable}" && "${cExecutable}"`;
            break;
          
          case "cpp":
            const cppSourceFile = path.join(tmpDir, "program.cpp");
            const cppExecutable = path.join(tmpDir, "program");
            await fs.writeFile(cppSourceFile, code);
            command = `g++ "${cppSourceFile}" -o "${cppExecutable}" && "${cppExecutable}"`;
            break;
          
          default:
            throw new Error(`Unsupported language: ${language}`);
        }

        // Execute with timeout of 30 seconds
        const { stdout, stderr } = await execAsync(command, {
          timeout: 30000,
          maxBuffer: 1024 * 1024, // 1MB
        });

        output = stdout;
        if (stderr) {
          error = stderr;
        }

        // Cleanup
        await fs.rm(tmpDir, { recursive: true, force: true });

      } catch (err: any) {
        success = false;
        error = err.message || String(err);
        if (err.stdout) output = err.stdout;
        if (err.stderr) error = err.stderr;
      }

      const executionTime = Date.now() - startTime;

      res.json({
        success,
        output: output || (success ? "Code executed successfully (no output)" : ""),
        error: error || undefined,
        executionTime,
      });

    } catch (error: any) {
      res.status(500).json({ 
        success: false,
        output: "",
        error: error.message || "Failed to execute code",
        executionTime: 0,
      });
    }
  });

  // Generate project
  app.post("/api/projects/generate", isAuthenticated, async (req, res) => {
    try {
      const { description } = req.body;
      
      if (!description) {
        return res.status(400).json({ error: "Project description is required" });
      }

      const project = await projectGenerator.generateProject(description);
      
      // Store project temporarily (in-memory for now)
      const projectId = `proj-${Date.now()}`;
      if (!storage.generatedProjects) {
        storage.generatedProjects = new Map();
      }
      storage.generatedProjects.set(projectId, project);

      res.json({ 
        projectId,
        project 
      });
    } catch (error: any) {
      console.error("Project generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate project" });
    }
  });

  // Download project as zip
  app.get("/api/projects/:id/download", isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!storage.generatedProjects || !storage.generatedProjects.has(id)) {
        return res.status(404).json({ error: "Project not found" });
      }

      const project = storage.generatedProjects.get(id)!;
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${project.name}.zip"`);

      const archive = archiver("zip", {
        zlib: { level: 9 }
      });

      archive.on("error", (err) => {
        console.error("Archive error:", err);
        res.status(500).json({ error: "Failed to create zip file" });
      });

      archive.pipe(res);

      // Add all files to the archive
      for (const file of project.files) {
        archive.append(file.content, { name: file.path });
      }

      await archive.finalize();
    } catch (error: any) {
      console.error("Download error:", error);
      res.status(500).json({ error: error.message || "Failed to download project" });
    }
  });

  return httpServer;
}
