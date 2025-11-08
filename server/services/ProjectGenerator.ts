import { llmProvider } from "../llm/LLMProvider.js";

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

export interface GeneratedProject {
  name: string;
  description: string;
  files: ProjectFile[];
  instructions: string;
}

class ProjectGenerator {
  async generateProject(description: string): Promise<GeneratedProject> {
    try {
      const prompt = `You are a project generator. Create a complete, working project based on this description:

"${description}"

Generate a COMPLETE, production-ready project with all necessary files. Include:
- All HTML, CSS, JavaScript files needed
- Package configuration (package.json if applicable)
- README with setup instructions
- Any config files needed

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "project-name",
  "description": "Brief project description",
  "files": [
    {"path": "index.html", "content": "file content here", "language": "html"},
    {"path": "style.css", "content": "file content here", "language": "css"},
    {"path": "script.js", "content": "file content here", "language": "javascript"}
  ],
  "instructions": "Step-by-step setup and run instructions"
}

IMPORTANT: 
1. Return ONLY the JSON object, no other text
2. Include ALL file content, not placeholders
3. Make the project actually work
4. Use modern, clean code
5. Include at least 3-5 files for a complete project`;

      const response = await llmProvider.chat([
        {
          role: "system",
          content: "You are an expert project generator. You create complete, working projects with all necessary files. Always return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ]);

      // Parse the response
      let jsonContent = response.content.trim();
      
      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      }

      const project: GeneratedProject = JSON.parse(jsonContent);

      // Validate the project structure
      if (!project.name || !project.files || !Array.isArray(project.files)) {
        throw new Error("Invalid project structure from AI");
      }

      // Ensure all files have required fields
      project.files = project.files.map((file) => ({
        path: file.path || "unnamed.txt",
        content: file.content || "",
        language: file.language || this.detectLanguage(file.path),
      }));

      return project;
    } catch (error) {
      console.error("Project generation error:", error);
      
      // Return a fallback simple project
      return this.getFallbackProject(description);
    }
  }

  private detectLanguage(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      html: "html",
      css: "css",
      js: "javascript",
      ts: "typescript",
      json: "json",
      md: "markdown",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      go: "go",
      rs: "rust",
    };
    return languageMap[ext || ""] || "text";
  }

  private getFallbackProject(description: string): GeneratedProject {
    return {
      name: "simple-project",
      description: description,
      files: [
        {
          path: "index.html",
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description}</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <h1>Welcome to Your Project</h1>
        <p>${description}</p>
    </div>
    <script src="script.js"></script>
</body>
</html>`,
          language: "html",
        },
        {
          path: "style.css",
          content: `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.container {
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    max-width: 600px;
    text-align: center;
}

h1 {
    color: #333;
    margin-bottom: 1rem;
}

p {
    color: #666;
}`,
          language: "css",
        },
        {
          path: "script.js",
          content: `console.log('Project loaded successfully!');

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready');
});`,
          language: "javascript",
        },
        {
          path: "README.md",
          content: `# ${description}

## Setup

1. Open \`index.html\` in a web browser
2. That's it! The project is ready to use.

## Files

- \`index.html\` - Main HTML file
- \`style.css\` - Styling
- \`script.js\` - JavaScript functionality

## Features

This is a simple web project. Customize it to fit your needs!`,
          language: "markdown",
        },
      ],
      instructions: "Simply open index.html in a web browser to view the project. No build step required!",
    };
  }
}

export const projectGenerator = new ProjectGenerator();
