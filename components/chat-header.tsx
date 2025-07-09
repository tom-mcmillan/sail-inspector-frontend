'use client';

import { useRouter } from 'next/navigation';
import { ModelSelector } from '@/components/model-selector';
import { Button } from '@/components/ui/button';
import { PlusIcon } from './icons';
import { memo } from 'react';
import { type VisibilityType, VisibilitySelector } from './visibility-selector';
import type { Session } from 'next-auth';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
  session,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  session: Session;
}) {
  const router = useRouter();

  return (
    <header className="bg-card border-b border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            title="New Chat"
            onClick={() => {
              router.push('/');
              router.refresh();
            }}
          >
            <PlusIcon size={16} />
            <span className="ml-2">New Chat</span>
          </Button>

          {!isReadonly && (
            <ModelSelector
              session={session}
              selectedModelId={selectedModelId}
            />
          )}

          {!isReadonly && (
            <VisibilitySelector
              chatId={chatId}
              selectedVisibilityType={selectedVisibilityType}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Sail MCP Chat
          </span>
        </div>
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
