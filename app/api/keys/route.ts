import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Simple file-based storage for API keys (temporary solution)
const KEYS_FILE = path.join(process.cwd(), 'data', 'api_keys.json');

function ensureDataDir() {
  const dataDir = path.dirname(KEYS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function loadKeys() {
  try {
    if (fs.existsSync(KEYS_FILE)) {
      return JSON.parse(fs.readFileSync(KEYS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('Error loading keys:', error);
  }
  return [];
}

function saveKeys(keys: any[]) {
  try {
    ensureDataDir();
    fs.writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving keys:', error);
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, name, email, server } = body;

    console.log('API key creation request:', { key: key?.substring(0, 8) + '...', name, email, server });

    // Validate inputs
    if (!key || !email || !server) {
      console.log('Validation failed - missing required fields');
      return NextResponse.json(
        { error: 'Key, email, and server are required' },
        { status: 400 }
      );
    }

    // Load existing keys
    const keys = loadKeys();
    
    // Check for duplicate key
    if (keys.some((k: any) => k.key === key)) {
      return NextResponse.json(
        { error: 'This API key already exists' },
        { status: 409 }
      );
    }

    // Add new key
    const newKey = {
      key,
      name: name || null,
      email,
      server,
      createdAt: new Date().toISOString()
    };
    
    keys.push(newKey);
    
    // Save to file
    if (!saveKeys(keys)) {
      throw new Error('Failed to save API key');
    }

    console.log('API key created successfully:', key?.substring(0, 8) + '...');

    return NextResponse.json({ 
      success: true,
      message: 'API key created successfully'
    });
  } catch (error: any) {
    console.error('Error creating API key:', error);
    
    return NextResponse.json(
      { error: 'Failed to create API key', details: error.message },
      { status: 500 }
    );
  }
}