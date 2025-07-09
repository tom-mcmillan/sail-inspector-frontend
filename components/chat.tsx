'use client';

// import { DefaultChatTransport } from 'ai';
// import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useDraggablePane } from '@/hooks/use-draggable';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { Artifact } from './artifact';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import type { VisibilityType } from './visibility-selector';
import { useArtifactSelector } from '@/hooks/use-artifact';
import type { Session } from 'next-auth';
import { useSearchParams } from 'next/navigation';
import { useChatVisibility } from '@/hooks/use-chat-visibility';
import { useAutoResume } from '@/hooks/use-auto-resume';
import type { Attachment, ChatMessage } from '@/lib/types';
import { useDataStream } from './data-stream-provider';

export function Chat({
  id,
  initialMessages,
  initialChatModel,
  initialVisibilityType,
  isReadonly,
  session,
  autoResume,
}: {
  id: string;
  initialMessages: ChatMessage[];
  initialChatModel: string;
  initialVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
  autoResume: boolean;
}) {
  const { visibilityType } = useChatVisibility({
    chatId: id,
    initialVisibilityType,
  });
  
  const { height: inputAreaHeight, handleDragStart } = useDraggablePane(200);

  const { mutate } = useSWRConfig();
  const { setDataStream } = useDataStream();
  
  // Note: mutate and setDataStream are available for future backend integration

  const [input, setInput] = useState<string>('');

  // Mock useChat implementation for now
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  
  const sendMessage = async (message: any) => {
    setStatus('loading');
    // TODO: Replace with your Agent API call
    console.log('Would send message to Agent:', message);
    setStatus('idle');
  };
  
  const stop = () => {
    setStatus('idle');
  };
  
  const regenerate = () => {
    console.log('Would regenerate with Agent');
  };
  
  const resumeStream = () => {
    console.log('Would resume stream with Agent');
  };

  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  const [hasAppendedQuery, setHasAppendedQuery] = useState(false);

  useEffect(() => {
    if (query && !hasAppendedQuery) {
      sendMessage({
        role: 'user' as const,
        parts: [{ type: 'text', text: query }],
      });

      setHasAppendedQuery(true);
      window.history.replaceState({}, '', `/chat/${id}`);
    }
  }, [query, sendMessage, hasAppendedQuery, id]);

  const { data: votes } = useSWR<Array<Vote>>(
    messages.length >= 2 ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  useAutoResume({
    autoResume,
    initialMessages,
    resumeStream,
    setMessages,
  });

  return (
    <>
      <div className="bg-card border-r border-border flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <Messages
            chatId={id}
            status={status}
            votes={votes}
            messages={messages}
            setMessages={setMessages}
            regenerate={regenerate}
            isReadonly={isReadonly}
            isArtifactVisible={isArtifactVisible}
          />
        </div>

        <div className="relative" style={{ height: `${inputAreaHeight}px` }}>
          {/* Draggable handle */}
          <div
            className="absolute top-0 left-0 right-0 h-4 -mt-2 cursor-ns-resize flex items-center justify-center"
            onMouseDown={handleDragStart}
          >
            <div className="absolute w-full h-px bg-border" />
            <div className="relative w-12 h-2 rounded-full" style={{ backgroundColor: '#ececf1' }} />
          </div>
          
          <div className="p-4 border-t border-border bg-card h-full overflow-hidden flex">
            {!isReadonly && (
              <div className="w-full max-w-3xl mx-auto flex">
                <MultimodalInput
                  chatId={id}
                  input={input}
                  setInput={setInput}
                  status={status}
                  stop={stop}
                  attachments={attachments}
                  setAttachments={setAttachments}
                  messages={messages}
                  setMessages={setMessages}
                  sendMessage={sendMessage}
                  selectedVisibilityType={visibilityType}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        status={status}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        sendMessage={sendMessage}
        messages={messages}
        setMessages={setMessages}
        regenerate={regenerate}
        votes={votes}
        isReadonly={isReadonly}
        selectedVisibilityType={visibilityType}
      />
    </>
  );
}
