import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page not found</p>
        <Button asChild data-testid="button-home">
          <a href="/">
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </a>
        </Button>
      </div>
    </div>
  );
}
