import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
}

export default function MetricCard({ title, value, trend, icon, className }: MetricCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.direction === "up") return <TrendingUp className="w-4 h-4" />;
    if (trend.direction === "down") return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return "";
    if (trend.direction === "up") return "text-green-600 dark:text-green-400";
    if (trend.direction === "down") return "text-red-600 dark:text-red-400";
    return "text-muted-foreground";
  };

  return (
    <Card className={cn("p-6", className)} data-testid="card-metric">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground" data-testid="text-metric-title">
            {title}
          </p>
          <p className="text-4xl font-bold" data-testid="text-metric-value">
            {value}
          </p>
          {trend && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", getTrendColor())}>
              {getTrendIcon()}
              <span>{trend.value > 0 ? "+" : ""}{trend.value}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
