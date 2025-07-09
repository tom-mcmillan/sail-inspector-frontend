import { auth, type UserType } from '@/app/(auth)/auth';
import { backendClient } from '@/lib/api/client';
import { entitlementsByUserType } from '@/lib/ai/entitlements';
import { postRequestBodySchema, type PostRequestBody } from './schema';
import { ChatSDKError } from '@/lib/errors';
import type { ChatMessage } from '@/lib/types';
import type { ChatModel } from '@/lib/ai/models';
import type { VisibilityType } from '@/components/visibility-selector';

export const maxDuration = 60;

// Convert UI messages to backend format
function convertToBackendMessages(messages: ChatMessage[]): Array<{ role: string; content: string }> {
  return messages.map((message) => ({
    role: message.role,
    content: Array.isArray(message.parts) 
      ? message.parts.map((part: any) => part.text).join('\n')
      : message.content || '',
  }));
}

export async function POST(request: Request) {
  let requestBody: PostRequestBody;

  try {
    const json = await request.json();
    requestBody = postRequestBodySchema.parse(json);
  } catch (_) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  try {
    const {
      id,
      message,
      selectedChatModel,
      selectedVisibilityType,
    }: {
      id: string;
      message: ChatMessage;
      selectedChatModel: ChatModel['id'];
      selectedVisibilityType: VisibilityType;
    } = requestBody;

    // Mock session for development without auth
    const mockSession = {
      user: {
        id: 'dev-user',
        email: 'dev@example.com',
        name: 'Development User',
        type: 'regular' as UserType,
      }
    };

    const userType: UserType = mockSession.user.type;

    // Rate limiting check (if you want to keep this on frontend)
    // You might want to move this to your backend service instead
    
    // Convert message to backend format
    const backendMessages = convertToBackendMessages([message]);

    // Determine model based on chat model selection
    const isReasoning = selectedChatModel === 'chat-model-reasoning';
    const model = isReasoning ? 'o1-preview' : 'gpt-4o';

    try {
      // Make request to backend service
      const response = await backendClient.createChatCompletion({
        messages: backendMessages,
        model,
        stream: true,
        temperature: 0.7,
        maxTokens: 4000,
      });

      // Forward the streaming response from backend
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (backendError) {
      console.error('Backend service error:', backendError);
      return new Response(
        JSON.stringify({ error: 'Backend service unavailable' }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  // Mock session for development without auth
  const mockSession = {
    user: {
      id: 'dev-user',
      email: 'dev@example.com',
      name: 'Development User',
      type: 'regular' as UserType,
    }
  };

  // For now, just return success
  // You might want to proxy this to your backend service as well
  return Response.json({ success: true }, { status: 200 });
}