import AgentCard from '../AgentCard';

export default function AgentCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AgentCard
        id="agent-001"
        name="Code Generator"
        status="executing"
        currentTask="Generating React component for user dashboard"
        tasksCompleted={45}
        successRate={96}
        onPause={() => console.log('Pause clicked')}
        onResume={() => console.log('Resume clicked')}
        onDelete={() => console.log('Delete clicked')}
        onClick={() => console.log('Card clicked')}
      />
      <AgentCard
        id="agent-002"
        name="Data Analyst"
        status="active"
        currentTask="Processing sales data from Q4 2024"
        tasksCompleted={132}
        successRate={98}
        onPause={() => console.log('Pause clicked')}
        onResume={() => console.log('Resume clicked')}
        onDelete={() => console.log('Delete clicked')}
        onClick={() => console.log('Card clicked')}
      />
      <AgentCard
        id="agent-003"
        name="Booking Assistant"
        status="idle"
        tasksCompleted={67}
        successRate={92}
        onPause={() => console.log('Pause clicked')}
        onResume={() => console.log('Resume clicked')}
        onDelete={() => console.log('Delete clicked')}
        onClick={() => console.log('Card clicked')}
      />
    </div>
  );
}
