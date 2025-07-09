import { auth } from '@/app/(auth)/auth';
import {
  getChatById,
  getMessagesByChatId,
} from '@/lib/db/queries';
import type { Chat } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';
import { backendClient } from '@/lib/api/client';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chatId } = await params;

  if (!chatId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chat').toResponse();
  }

  let chat: Chat | null;

  try {
    chat = await getChatById({ id: chatId });
  } catch {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (!chat) {
    return new ChatSDKError('not_found:chat').toResponse();
  }

  if (chat.visibility === 'private' && chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chat').toResponse();
  }

  try {
    // Get messages from the database
    const messages = await getMessagesByChatId({ id: chatId });
    
    // Convert messages to the format expected by the backend
    const formattedMessages = messages.map(msg => ({
      role: msg.role,
      content: Array.isArray(msg.parts) ? msg.parts.map(part => part.text || '').join('') : String(msg.parts)
    }));

    // Create streaming response from backend service
    const response = await backendClient.createChatCompletion({
      messages: formattedMessages,
      stream: true
    });

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error creating chat completion:', error);
    return new ChatSDKError('bad_request:api').toResponse();
  }
}
