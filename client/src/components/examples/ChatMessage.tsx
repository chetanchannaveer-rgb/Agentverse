import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="max-w-4xl">
      <ChatMessage
        role="user"
        content="Create a booking system that can handle flight reservations"
        timestamp="2:34 PM"
      />
      <ChatMessage
        role="agent"
        agentName="Booking Assistant"
        content="I'll help you create a booking system for flight reservations. First, let me analyze the requirements and break this down into manageable tasks. I'll need to set up the data schema, create the API endpoints, and build the user interface."
        timestamp="2:35 PM"
      />
      <ChatMessage
        role="user"
        content="Can you integrate with real airline booking websites?"
        timestamp="2:36 PM"
      />
      <ChatMessage
        role="agent"
        agentName="Booking Assistant"
        content="Yes! I can navigate users to official airline booking websites. I'll detect booking intents and redirect to trusted sites like Expedia, Kayak, or direct airline websites with the appropriate search parameters pre-filled."
        timestamp="2:36 PM"
      />
    </div>
  );
}
