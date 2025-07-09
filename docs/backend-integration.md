# Sail MCP Platform Frontend - Backend Integration Guide

## Overview

This document outlines the integration points between the Sail MCP Platform frontend and your backend services. The frontend is built with Next.js 15 and is designed to work with an OpenAI Agents SDK backend using the Responses API.

## Architecture

- **Frontend**: Next.js 15.3.0 (this repository)
- **Expected Backend**: OpenAI Agents SDK with Responses API
- **Communication**: REST API calls via the API client

## Integration Points

### 1. API Client Location

The API client stub is located at `/lib/api/client.ts`. This file contains the `BackendApiClient` class with methods that need to be implemented:

```typescript
export class BackendApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  // Methods to implement:
  async createChatCompletion(params: {...})
  async createAgent(params: {...})
  async createThread()
  async createMessage(threadId: string, params: {...})
  async createRun(threadId: string, params: {...})
  async getRunStatus(threadId: string, runId: string)
  async listMessages(threadId: string)
}
```

### 2. Frontend Form Data

The sidebar collects the following data that should be sent to your backend:

#### Connection Parameters
- **URL** (`command` state variable): The MCP server endpoint URL
  - Placeholder: "https://example.com/mcp"
  - This should be the base URL for your MCP server

- **Key** (`args` state variable): API authentication key
  - Placeholder: "s-abc..0xyz"
  - This is the API key for authenticating requests

- **System Message** (`systemMessage` state variable): System prompt for the model
  - Placeholder: "Describe the desired model behavior"
  - This should be passed as the system message when creating agents/threads

#### Connection Status
- **isConnected** (`isConnected` state): Boolean indicating connection status
- **logLevel** (`logLevel` state): Selected logging level (debug, info, warn, error)

### 3. Chat Interface Integration

The chat component (`/components/chat.tsx`) currently has mock implementations for these methods:

```typescript
// Line 55-60: Mock sendMessage implementation
const sendMessage = async (message: any) => {
  setStatus('loading');
  // TODO: Replace with your Agent API call
  console.log('Would send message to Agent:', message);
  setStatus('idle');
};

// Message format:
{
  role: 'user',
  parts: [
    {
      type: 'text',
      text: 'user input text'
    },
    // Optional file attachments:
    {
      type: 'file',
      url: 'file_url',
      name: 'filename',
      mediaType: 'content_type'
    }
  ]
}
```

### 4. Expected API Endpoints

Based on the frontend structure, your backend should implement:

#### Authentication
- Use the API key from the "Key" field in the Authorization header
- Format: `Authorization: Bearer ${apiKey}`

#### MCP Server Connection
- **POST** `/api/connect`
  - Body: `{ url: string, systemMessage: string }`
  - Response: `{ connected: boolean, sessionId?: string }`

#### Chat Operations
- **POST** `/api/chat/completions`
  - Body: `{ messages: Message[], sessionId: string }`
  - Response: Stream or standard response based on OpenAI format

- **POST** `/api/threads`
  - Creates a new conversation thread
  - Response: `{ threadId: string }`

- **POST** `/api/threads/{threadId}/messages`
  - Adds a message to a thread
  - Body: `{ role: string, content: string }`

- **POST** `/api/threads/{threadId}/runs`
  - Executes the agent on the thread
  - Response: `{ runId: string }`

### 5. File Upload Support

The frontend supports file attachments. Files are uploaded to `/api/files/upload`:

```typescript
// Expected endpoint:
POST /api/files/upload
Content-Type: multipart/form-data

// Response:
{
  url: string,      // URL to access the file
  pathname: string, // File path/name
  contentType: string
}
```

### 6. Environment Variables

Add these to your `.env.local`:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_KEY=your-default-api-key
```

### 7. WebSocket/Streaming Support

The frontend includes a `DataStreamProvider` component that can handle streaming responses. If your backend supports streaming:

1. Implement SSE (Server-Sent Events) or WebSocket endpoints
2. Update the `useDataStream` hook usage in the chat component
3. Stream tokens/chunks back for real-time display

### 8. Mock Implementations to Replace

These files contain mock implementations that need backend integration:

1. `/lib/db/queries.ts` - All database queries return mock data
2. `/app/api/` routes - Currently have placeholder implementations
3. `/components/chat.tsx` - Lines 55-72 contain mock chat methods

### 9. State Management

The frontend maintains these states that your backend should handle:

- **Chat Messages**: Array of message objects
- **Connection Status**: Connected/Disconnected state
- **Active Thread/Session**: Current conversation context
- **User Settings**: System message, logging level

### 10. Error Handling

Implement error responses in this format:

```typescript
{
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

The frontend will display these via toast notifications.

## Quick Start for Backend Developers

1. Clone this frontend repository
2. Install dependencies: `npm install`
3. Create `.env.local` with your backend URL
4. Update `/lib/api/client.ts` with actual API calls
5. Replace mock implementations in `/components/chat.tsx`
6. Test the integration with: `npm run dev`

## Testing the Integration

1. Start your backend service
2. Run the frontend: `npm run dev`
3. Open http://localhost:3000
4. Enter your backend URL in the "URL" field
5. Enter your API key in the "Key" field
6. Add a system message
7. Click "Connect"
8. Start chatting!

## Support

For frontend-specific questions, refer to the component files. The main integration points are clearly marked with `TODO` comments.