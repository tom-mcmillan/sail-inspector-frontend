import { cookies } from 'next/headers';

import { ResizableSidebar } from '@/components/resizable-sidebar';
import Script from 'next/script';
import { DataStreamProvider } from '@/components/data-stream-provider';

// export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Mock user for development without auth
  const mockUser = {
    id: 'dev-user',
    email: 'dev@example.com',
    name: 'Development User',
    type: 'regular' as const,
  };

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <div className="flex h-screen">
          {/* Resizable Sidebar */}
          <ResizableSidebar user={mockUser} />
          
          {/* Main Content */}
          <div className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </DataStreamProvider>
    </>
  );
}
