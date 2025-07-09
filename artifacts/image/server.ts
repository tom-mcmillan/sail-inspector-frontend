import { backendConfig } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';

// Mock AI SDK function
export async function experimental_generateImage(config: any) {
  return {
    image: {
      url: 'https://via.placeholder.com/400x300?text=Generated+Image',
      alt: 'Generated image placeholder',
      base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    }
  };
}

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: backendConfig.models.artifact,
      prompt: title,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return draftContent;
  },
  onUpdateDocument: async ({ description, dataStream }) => {
    let draftContent = '';

    const { image } = await experimental_generateImage({
      model: backendConfig.models.artifact,
      prompt: description,
      n: 1,
    });

    draftContent = image.base64;

    dataStream.write({
      type: 'data-imageDelta',
      data: image.base64,
      transient: true,
    });

    return draftContent;
  },
});
