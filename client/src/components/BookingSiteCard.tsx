import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface BookingSiteCardProps {
  name: string;
  description: string;
  url: string;
  logo?: string;
  category: string;
}

export default function BookingSiteCard({ name, description, url, category }: BookingSiteCardProps) {
  const handleNavigate = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
    console.log(`Navigating to ${name}: ${url}`);
  };

  return (
    <Card className="p-6 hover-elevate transition-all" data-testid="card-booking-site">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base" data-testid="text-site-name">{name}</h3>
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">
              {category}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Button 
        variant="outline" 
        className="w-full gap-2"
        onClick={handleNavigate}
        data-testid="button-navigate"
      >
        Navigate to {name}
        <ExternalLink className="w-4 h-4" />
      </Button>
    </Card>
  );
}
