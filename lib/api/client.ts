// API client for backend service
export class BackendApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
  }

  // Chat API methods
  async createChatCompletion(params: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    stream?: boolean;
    temperature?: number;
    maxTokens?: number;
  }) {
    const response = await fetch(`${this.baseUrl}/api/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Agent API methods
  async createAgent(params: {
    name: string;
    instructions: string;
    model?: string;
    tools?: any[];
  }) {
    const response = await fetch(`${this.baseUrl}/api/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAgent(agentId: string) {
    const response = await fetch(`${this.baseUrl}/api/agents/${agentId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async updateAgent(agentId: string, params: {
    name?: string;
    instructions?: string;
    model?: string;
    tools?: any[];
  }) {
    const response = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteAgent(agentId: string) {
    const response = await fetch(`${this.baseUrl}/api/agents/${agentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Thread API methods
  async createThread() {
    const response = await fetch(`${this.baseUrl}/api/threads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getThread(threadId: string) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteThread(threadId: string) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Message API methods
  async createMessage(threadId: string, params: {
    role: 'user' | 'assistant';
    content: string;
    attachments?: any[];
  }) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getMessages(threadId: string, params?: {
    limit?: number;
    order?: 'asc' | 'desc';
    after?: string;
    before?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.order) searchParams.append('order', params.order);
    if (params?.after) searchParams.append('after', params.after);
    if (params?.before) searchParams.append('before', params.before);

    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}/messages?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Run API methods (for agent responses)
  async createRun(threadId: string, params: {
    agentId: string;
    instructions?: string;
    stream?: boolean;
  }) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getRun(threadId: string, runId: string) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}/runs/${runId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async cancelRun(threadId: string, runId: string) {
    const response = await fetch(`${this.baseUrl}/api/threads/${threadId}/runs/${runId}/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const backendClient = new BackendApiClient();