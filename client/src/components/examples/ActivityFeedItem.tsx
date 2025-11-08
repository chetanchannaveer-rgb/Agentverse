import ActivityFeedItem from '../ActivityFeedItem';

export default function ActivityFeedItemExample() {
  return (
    <div className="max-w-2xl">
      <ActivityFeedItem
        title="Agent Created"
        description="New agent 'Code Generator' initialized with default capabilities"
        timestamp="2m ago"
        type="success"
      />
      <ActivityFeedItem
        title="Task Completed"
        description="Successfully generated 3 React components with TypeScript"
        timestamp="5m ago"
        type="success"
      />
      <ActivityFeedItem
        title="Execution Error"
        description="Failed to compile generated code due to syntax error in line 42"
        timestamp="12m ago"
        type="error"
      />
      <ActivityFeedItem
        title="System Update"
        description="LLM provider switched from local simulator to OpenAI GPT-4"
        timestamp="1h ago"
        type="info"
        isLast
      />
    </div>
  );
}
