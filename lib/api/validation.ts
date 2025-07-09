// API validation utilities for testing server connections

export interface ValidationResult {
  success: boolean;
  error?: string;
  errorType?: 'network' | 'auth' | 'invalid_url' | 'server_error' | 'timeout';
}

export interface ServerCredentials {
  serverUrl: string;
  apiKey: string;
}

/**
 * Validates server connection and API key by making a test request
 */
export async function validateServerConnection(
  credentials: ServerCredentials
): Promise<ValidationResult> {
  const { serverUrl, apiKey } = credentials;

  try {
    // Normalize the server URL
    const normalizedUrl = normalizeServerUrl(serverUrl);
    
    // Test endpoint - try a simple health check or agents list
    const testUrl = `${normalizedUrl}/health`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return { success: true };
      }

      // Handle different HTTP error codes
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: 'Invalid API key or insufficient permissions',
          errorType: 'auth',
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: 'Server endpoint not found. Please check the server URL.',
          errorType: 'invalid_url',
        };
      }

      if (response.status >= 500) {
        return {
          success: false,
          error: 'Server error. Please try again later.',
          errorType: 'server_error',
        };
      }

      return {
        success: false,
        error: `Server returned status ${response.status}`,
        errorType: 'server_error',
      };

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return {
          success: false,
          error: 'Connection timeout. Please check the server URL.',
          errorType: 'timeout',
        };
      }

      throw fetchError;
    }

  } catch (error: any) {
    // Network or parsing errors
    if (error.message?.includes('Failed to fetch') || error.code === 'NETWORK_ERROR') {
      return {
        success: false,
        error: 'Unable to connect to server. Please check the URL and your network connection.',
        errorType: 'network',
      };
    }

    return {
      success: false,
      error: `Connection failed: ${error.message || 'Unknown error'}`,
      errorType: 'network',
    };
  }
}

/**
 * Normalizes server URL by ensuring it has proper protocol and removing trailing slash
 */
function normalizeServerUrl(url: string): string {
  let normalized = url.trim();
  
  // Add https:// if no protocol specified
  if (!normalized.match(/^https?:\/\//)) {
    normalized = `https://${normalized}`;
  }
  
  // Remove trailing slash
  normalized = normalized.replace(/\/$/, '');
  
  return normalized;
}

/**
 * Validates URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const normalized = normalizeServerUrl(url);
    new URL(normalized);
    return true;
  } catch {
    return false;
  }
}