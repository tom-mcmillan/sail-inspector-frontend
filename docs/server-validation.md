# Server Connection Validation

This system validates server connections and API keys before storing them, ensuring users get immediate feedback about their configuration.

## How It Works

### Frontend Validation Flow

1. **User Input**: User enters name, email, and server URL in the create secret key modal
2. **Key Generation**: System generates a new API key 
3. **Connection Test**: Frontend makes a test request to `{serverUrl}/health` with the generated key
4. **Validation Result**: Shows success/failure feedback before saving the key
5. **Save on Success**: Only saves the key if validation passes

### Architecture Decision

We chose **frontend validation** over backend validation because:
- ✅ Immediate user feedback
- ✅ Keeps agent focused on core functionality 
- ✅ Prevents storing invalid credentials
- ✅ Clear UI/UX for connection issues

## Validation Function

```typescript
import { validateServerConnection } from '@/lib/api/validation';

const result = await validateServerConnection({
  serverUrl: 'https://your-server.com',
  apiKey: 's-your-api-key'
});

if (result.success) {
  // Connection successful
} else {
  // Handle error: result.error, result.errorType
}
```

## Error Types

| Error Type | Description | Common Causes |
|------------|-------------|---------------|
| `auth` | Authentication failed | Invalid API key, insufficient permissions |
| `network` | Network connectivity issues | Server down, DNS issues, firewall |
| `timeout` | Request timed out | Slow server response, network congestion |
| `invalid_url` | Server endpoint not found | Wrong URL, missing `/health` endpoint |
| `server_error` | Server returned error | Server misconfiguration, internal errors |

## Modal States

### 1. Form State
- User inputs credentials
- Submit button shows "Create secret key"
- Real-time validation of required fields

### 2. Validating State  
- Shows loading spinner
- "Testing connection to {server}..."
- Cannot be cancelled during validation

### 3. Validation Error State
- Shows error type and message
- Troubleshooting tips
- "Try Again" and "Cancel" buttons

### 4. Success State
- Shows generated key with copy functionality
- Key is saved and ready to use

## Server Requirements

Your OpenAI Agents SDK server should expose a `/health` endpoint that:
- Accepts `GET` requests
- Requires `Authorization: Bearer {key}` header
- Returns `200 OK` for valid keys
- Returns `401` for invalid keys

Example implementation:
```javascript
app.get('/health', authenticateKey, (req, res) => {
  res.json({ status: 'ok', authenticated: true });
});
```

## URL Normalization

The system automatically normalizes URLs:
- Adds `https://` if no protocol specified
- Removes trailing slashes
- Validates URL format

Examples:
- `example.com` → `https://example.com`
- `https://api.example.com/` → `https://api.example.com`

## Testing

Run validation tests:
```bash
npm test lib/api/validation
```

## Troubleshooting

### Common Issues

1. **Connection timeout**: Check server is running and accessible
2. **Authentication error**: Verify API key format and permissions
3. **Network error**: Check DNS resolution and firewall settings
4. **Invalid URL**: Ensure server URL is correctly formatted

### Testing Your Server

You can test your server manually:
```bash
curl -H "Authorization: Bearer s-your-key" https://your-server.com/health
```

Should return `200 OK` for valid keys.