import { z } from 'zod';
import type { Session } from 'next-auth';
import { getDocumentById, saveSuggestions } from '@/lib/db/queries';
import type { Suggestion } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { backendConfig } from '../providers';
import type { ChatMessage } from '@/lib/types';
import { tool, type UIMessageStreamWriter } from './create-document';

// Mock streamObject function
export function streamObject(config: any) {
  return {
    elementStream: async function* () {
      // Mock stream response
      yield {
        originalSentence: 'Example original sentence',
        suggestedSentence: 'Example suggested sentence',
        description: 'Example description'
      };
    },
    fullStream: (async function* () {
      // Mock full stream response - adapt based on schema
      const schema = config.schema;
      const shape = schema?.shape || {};
      
      const mockData: any = {};
      
      // Create mock data based on the expected schema
      if (shape.code) {
        mockData.code = 'Mock code response';
      }
      if (shape.csv) {
        mockData.csv = 'Name,Age,City\nJohn,30,New York\nJane,25,Chicago';
      }
      if (shape.text) {
        mockData.text = 'Mock text response';
      }
      
      yield { type: 'object', object: mockData };
    })()
  };
}

interface RequestSuggestionsProps {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
}

export const requestSuggestions = ({
  session,
  dataStream,
}: RequestSuggestionsProps) =>
  tool({
    description: 'Request suggestions for a document',
    inputSchema: z.object({
      documentId: z
        .string()
        .describe('The ID of the document to request edits'),
    }),
    execute: async ({ documentId }: any) => {
      const document = await getDocumentById({ id: documentId });

      if (!document || !document.content) {
        return {
          error: 'Document not found',
        };
      }

      const suggestions: Array<
        Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
      > = [];

      const { elementStream } = streamObject({
        model: backendConfig.models.artifact,
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
        }),
      });

      for await (const element of elementStream()) {
        // @ts-ignore todo: fix type
        const suggestion: Suggestion = {
          originalText: element.originalSentence,
          suggestedText: element.suggestedSentence,
          description: element.description,
          id: generateUUID(),
          documentId: documentId,
          isResolved: false,
        };

        dataStream.write({
          type: 'data-suggestion',
          data: suggestion,
          transient: true,
        });

        suggestions.push(suggestion);
      }

      if (session.user?.id) {
        const userId = session.user.id;

        await saveSuggestions({
          suggestions: suggestions.map((suggestion) => ({
            ...suggestion,
            userId,
            createdAt: new Date(),
            documentCreatedAt: document.createdAt,
            title: document.title,
            description: suggestion.description || '',
          })),
        });
      }

      return {
        id: documentId,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });
