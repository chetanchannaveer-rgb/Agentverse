import MetricCard from '../MetricCard';
import { Cpu, CheckCircle, Activity } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard
        title="Total Agents"
        value={12}
        trend={{ value: 8.2, direction: "up" }}
        icon={<Cpu className="w-6 h-6" />}
      />
      <MetricCard
        title="Active Tasks"
        value={5}
        trend={{ value: -3.1, direction: "down" }}
        icon={<Activity className="w-6 h-6" />}
      />
      <MetricCard
        title="Success Rate"
        value="94%"
        trend={{ value: 2.5, direction: "up" }}
        icon={<CheckCircle className="w-6 h-6" />}
      />
    </div>
  );
}
