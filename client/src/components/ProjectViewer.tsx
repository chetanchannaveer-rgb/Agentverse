import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileCode, FolderOpen } from "lucide-react";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ProjectFile {
  path: string;
  content: string;
}

interface GeneratedProject {
  name: string;
  description: string;
  files: ProjectFile[];
}

interface ProjectViewerProps {
  projectId: string;
  project: GeneratedProject;
}

export function ProjectViewer({ projectId, project }: ProjectViewerProps) {
  const [downloadingProject, setDownloadingProject] = useState(false);

  const handleDownload = async () => {
    try {
      setDownloadingProject(true);
      const response = await fetch(`/api/projects/${projectId}/download`);
      
      if (!response.ok) {
        throw new Error("Failed to download project");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloadingProject(false);
    }
  };

  return (
    <Card className="w-full" data-testid="card-project-viewer">
      <CardHeader className="gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-primary" />
            <CardTitle data-testid="text-project-name">{project.name}</CardTitle>
          </div>
          <Button
            onClick={handleDownload}
            disabled={downloadingProject}
            size="sm"
            data-testid="button-download-project"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadingProject ? "Downloading..." : "Download ZIP"}
          </Button>
        </div>
        <CardDescription data-testid="text-project-description">
          {project.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {project.files.length} file{project.files.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="space-y-2">
          {project.files.map((file, index) => (
            <Collapsible key={index}>
              <CollapsibleTrigger className="w-full" asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2"
                  data-testid={`button-file-${index}`}
                >
                  <FileCode className="w-4 h-4" />
                  <span className="text-sm font-mono">{file.path}</span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {file.content.split('\n').length} lines
                  </Badge>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="ml-6 mt-2 rounded-md bg-muted p-3">
                  <pre className="text-xs overflow-x-auto" data-testid={`code-file-${index}`}>
                    <code>{file.content}</code>
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
