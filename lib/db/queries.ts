// Mock database queries for frontend-only mode

import type { ArtifactKind } from '@/components/artifact';
import { generateUUID } from '../utils';
import type { VisibilityType } from '@/components/visibility-selector';

// Mock types
export type User = {
  id: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Chat = {
  id: string;
  createdAt: Date;
  title: string;
  userId: string;
  path: string;
  visibility: VisibilityType;
  updatedAt: Date;
};

export type DBMessage = {
  id: string;
  chatId: string;
  role: string;
  parts: any[];
  createdAt: Date;
  attachments: any[];
};

export type Suggestion = {
  id: string;
  documentId: string;
  title: string;
  description: string;
  isResolved: boolean;
  userId: string;
  createdAt: Date;
};

// Mock functions - replace with your Agent/API calls later
export async function getUser(email: string): Promise<Array<User>> {
  return [];
}

export async function createUser(email: string, password: string): Promise<User> {
  return {
    id: generateUUID(),
    email,
    password,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createGuestUser(): Promise<User> {
  return {
    id: generateUUID(),
    email: 'guest@example.com',
    password: 'guest',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function saveChat(params: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function deleteChatById({ id }: { id: string }): Promise<Chat> {
  return {
    id,
    createdAt: new Date(),
    title: 'Deleted Chat',
    userId: 'mock-user',
    path: '/mock',
    visibility: 'private',
    updatedAt: new Date(),
  };
}

export async function getChatsByUserId({ id }: { id: string }): Promise<Array<Chat>> {
  return [];
}

export async function getChatById({ id }: { id: string }): Promise<Chat | null> {
  return null;
}

export async function saveMessages({ messages }: { messages: any[] }): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getMessagesByChatId({ id }: { id: string }): Promise<Array<DBMessage>> {
  return [];
}

export async function getMessageCountByUserId(params: {
  id: string;
  differenceInHours: number;
}): Promise<number> {
  return 0;
}

export async function voteMessage(params: {
  chatId: string;
  messageId: string;
  type: 'up' | 'down';
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getVotesByChatId(chatId: string): Promise<Array<any>> {
  return [];
}

export async function saveDocument(params: {
  id: string;
  title: string;
  content: string;
  userId: string;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getDocumentsById(params: { id: string }): Promise<Array<any>> {
  return [];
}

export async function getDocumentById(params: { id: string }): Promise<any | null> {
  return null;
}

export async function deleteDocumentsByIdAfterTimestamp(params: {
  id: string;
  timestamp: Date;
}): Promise<any> {
  return [];
}

export async function saveSuggestions(params: {
  suggestions: Array<{
    id: string;
    documentId: string;
    title: string;
    description: string;
    userId: string;
  }>;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getSuggestionsByDocumentId(params: {
  documentId: string;
}): Promise<Array<Suggestion>> {
  return [];
}

export async function createStreamId(params: {
  streamId: string;
  chatId: string;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getStreamById(params: { id: string }): Promise<any | null> {
  return null;
}

export async function updateMessageContentById(params: {
  id: string;
  content: any;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function deleteMessagesByChatIdAfterTimestamp(params: {
  chatId: string;
  timestamp: Date;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}

export async function getMessageById(params: { id: string }): Promise<Array<DBMessage>> {
  return [];
}

export async function updateChatVisiblityById(params: {
  chatId: string;
  visibility: VisibilityType;
}): Promise<void> {
  // Mock - would integrate with your Agent API
}