import { validateServerConnection, isValidUrl } from '../validation';

// Mock fetch for testing
global.fetch = jest.fn();

describe('validateServerConnection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return success for valid server response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    const result = await validateServerConnection({
      serverUrl: 'https://example.com',
      apiKey: 's-test123',
    });

    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/health',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Authorization': 'Bearer s-test123',
          'Content-Type': 'application/json',
        },
      })
    );
  });

  it('should return auth error for 401 response', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
    });

    const result = await validateServerConnection({
      serverUrl: 'https://example.com',
      apiKey: 's-test123',
    });

    expect(result.success).toBe(false);
    expect(result.errorType).toBe('auth');
    expect(result.error).toContain('Invalid API key');
  });

  it('should return network error for fetch failure', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const result = await validateServerConnection({
      serverUrl: 'https://example.com',
      apiKey: 's-test123',
    });

    expect(result.success).toBe(false);
    expect(result.errorType).toBe('network');
    expect(result.error).toContain('Unable to connect to server');
  });

  it('should normalize URLs correctly', async () => {
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
    });

    await validateServerConnection({
      serverUrl: 'example.com/api/',
      apiKey: 's-test123',
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/api/health',
      expect.any(Object)
    );
  });
});

describe('isValidUrl', () => {
  it('should validate correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('example.com')).toBe(true);
  });

  it('should reject invalid URLs', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
  });
});