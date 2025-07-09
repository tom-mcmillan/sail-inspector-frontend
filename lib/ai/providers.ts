// Frontend configuration for backend service
export const backendConfig = {
  // Backend service URL
  baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000',
  
  // Model configurations (these will be handled by the backend)
  models: {
    chat: 'gpt-4o',
    reasoning: 'o1-preview',
    title: 'gpt-4o-mini',
    artifact: 'gpt-4o',
  },
  
  // Default agent configurations
  agents: {
    chatAgent: {
      name: 'Chat Assistant',
      instructions: 'You are a helpful assistant that provides clear, concise responses.',
      model: 'gpt-4o',
    },
    reasoningAgent: {
      name: 'Reasoning Assistant',
      instructions: 'You are a reasoning assistant that thinks through problems step by step.',
      model: 'o1-preview',
    },
    titleAgent: {
      name: 'Title Generator',
      instructions: 'Generate concise, descriptive titles for conversations.',
      model: 'gpt-4o-mini',
    },
    artifactAgent: {
      name: 'Artifact Generator',
      instructions: 'Generate code, documents, and other artifacts based on user requests.',
      model: 'gpt-4o',
    },
  },
};

// Export for backward compatibility
export const myProvider = null;
export const openaiClient = null;