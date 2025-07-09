'use client';

import { useState } from 'react';
import { ChevronDownIcon, PlayIcon, PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateSecretKeyModal } from '@/components/create-secret-key-modal';
// Removed unused Label import
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Icons from Lucide (matching the reference)
const SettingsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m8.48 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m8.48 0l4.24 4.24"/>
  </svg>
);

const RotateCcwIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
  </svg>
);

const RefreshCwOffIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
    <path d="M3 3v5h5"/>
    <path d="M21 21v-5h-5"/>
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
);

export function AppSidebar({ user }: { user: any }) {
  const [transportType, setTransportType] = useState('stdio');
  const [command, setCommand] = useState('npx');
  const [args, setArgs] = useState('@modelcontextprotocol/server-everything');
  const [isConnected, setIsConnected] = useState(false);
  const [logLevel, setLogLevel] = useState('debug');
  const [systemMessage, setSystemMessage] = useState('');
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);

  const handleConnect = () => {
    setIsConnected(!isConnected);
  };

  const connectionStatus = isConnected ? 'connected' : 'disconnected';

  return (
    <div className="bg-card border-r border-border flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-border">
        <div className="flex items-center">
          <h1 className="ml-2 text-lg font-semibold">
            Sail MCP Platform v0.1.0
          </h1>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="command-input">
              Server
            </label>
            <Input
              id="command-input"
              placeholder="https://example.com/mcp"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium" htmlFor="arguments-input">
                Key
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateKeyModal(true)}
                className="text-xs h-auto py-1.5 px-3 text-gray-700 rounded-md"
                style={{ backgroundColor: '#ececf1' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d1d5db'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ececf1'}
              >
                <PlusIcon size={10} className="mr-1" />
                Create new secret key
              </Button>
            </div>
            <Input
              id="arguments-input"
              placeholder=""
              value={args}
              onChange={(e) => setArgs(e.target.value)}
              className="focus:outline-none focus:ring-1 focus:ring-border"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="system-message-input">
              System message (optional)
            </label>
            <textarea
              id="system-message-input"
              placeholder="Describe the desired model behavior"
              value={systemMessage}
              onChange={(e) => setSystemMessage(e.target.value)}
              className="w-full min-h-[120px] p-3 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-border resize-y"
              rows={6}
            />
          </div>


          <div className="space-y-2">
            {connectionStatus === "connected" && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => {
                    setIsConnected(false);
                    setTimeout(() => setIsConnected(true), 100);
                  }}
                >
                  <RotateCcwIcon size={16} />
                  <span className="ml-2">Restart</span>
                </Button>
                <Button onClick={() => setIsConnected(false)}>
                  <RefreshCwOffIcon size={16} />
                  <span className="ml-2">Disconnect</span>
                </Button>
              </div>
            )}
            {connectionStatus !== "connected" && (
              <Button className="w-full bg-black hover:bg-gray-800 text-white" onClick={handleConnect}>
                <PlayIcon size={16} />
                <span className="ml-2">Connect</span>
              </Button>
            )}

            <div className="flex items-center justify-center space-x-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === "connected" ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {connectionStatus === "connected" ? "Connected" : "Disconnected"}
              </span>
            </div>

            {isConnected && (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="logging-level-select">
                  Logging Level
                </label>
                <Select
                  value={logLevel}
                  onValueChange={(value: string) => setLogLevel(value)}
                >
                  <SelectTrigger id="logging-level-select">
                    <SelectValue placeholder="Select logging level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">debug</SelectItem>
                    <SelectItem value="info">info</SelectItem>
                    <SelectItem value="warn">warn</SelectItem>
                    <SelectItem value="error">error</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <CreateSecretKeyModal 
        isOpen={showCreateKeyModal}
        onClose={() => setShowCreateKeyModal(false)}
      />
    </div>
  );
}