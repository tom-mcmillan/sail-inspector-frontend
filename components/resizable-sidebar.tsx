'use client';

import { AppSidebar } from './app-sidebar';
import { useDraggableSidebar } from '@/hooks/use-draggable';

export function ResizableSidebar({ user }: { user: any }) {
  const { width, isDragging, handleDragStart } = useDraggableSidebar(320);

  return (
    <div className="flex h-full">
      <div
        className="flex-shrink-0 relative"
        style={{ width: `${width}px` }}
      >
        <AppSidebar user={user} />
        <div
          className="absolute top-0 -right-2 w-4 h-full cursor-col-resize flex items-center justify-center"
          onMouseDown={handleDragStart}
        >
          {/* Vertical line */}
          <div className="absolute w-px h-full bg-border" />
          {/* Gray handle that spans both sides of the line */}
          <div className="relative w-2 h-12 rounded-full" style={{ backgroundColor: '#ececf1' }} />
        </div>
      </div>
    </div>
  );
}