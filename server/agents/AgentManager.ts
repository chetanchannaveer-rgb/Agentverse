import { randomUUID } from "crypto";

export interface Agent {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

class AgentManager {
  private agents: Map<string, Agent>;

  constructor() {
    this.agents = new Map();
    this.initializeDefaultAgents();
  }

  private initializeDefaultAgents() {
    const defaultAgents = [
      {
        id: "learning-assistant",
        name: "Learning Assistant",
        description: "Helps with study plans, quizzes, and learning goals"
      },
      {
        id: "booking-navigator",
        name: "Booking Navigator", 
        description: "Assists with travel bookings and reservations"
      },
      {
        id: "code-helper",
        name: "Code Helper",
        description: "Provides coding assistance and debugging help"
      }
    ];

    for (const agent of defaultAgents) {
      this.agents.set(agent.id, { ...agent, createdAt: new Date() });
    }
  }

  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): Agent | undefined {
    return this.agents.get(id);
  }

  createAgent(name: string, description: string = ""): Agent {
    const id = randomUUID();
    const agent: Agent = {
      id,
      name,
      description,
      createdAt: new Date()
    };
    this.agents.set(id, agent);
    return agent;
  }

  deleteAgent(id: string): boolean {
    return this.agents.delete(id);
  }

  async executeTask(agentId: string, task: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return `Agent ${agent.name} executed task: ${task}`;
  }

  async chatWithAgent(agentId: string, message: string): Promise<string> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    return `Agent ${agent.name} response to: ${message}`;
  }
}

export const agentManager = new AgentManager();
