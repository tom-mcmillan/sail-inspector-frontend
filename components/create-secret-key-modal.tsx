'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon } from '@/components/icons';
import { validateServerConnection, type ValidationResult } from '@/lib/api/validation';

interface CreateSecretKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function generateApiKey(): string {
  // Generate a 10-character alphanumeric key
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = '';
  for (let i = 0; i < 10; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export function CreateSecretKeyModal({ isOpen, onClose }: CreateSecretKeyModalProps) {
  const [step, setStep] = useState<'form' | 'validating' | 'validation-error' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    server: ''
  });
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [validationError, setValidationError] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check if all required fields are filled
  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.server.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.server) {
      alert('Please fill in all required fields: Name, Email, and Server');
      return;
    }
    
    setIsSubmitting(true);
    setStep('validating');
    
    // Generate the API key
    const apiKey = generateApiKey();
    setGeneratedKey(apiKey);
    
    try {
      // First, validate the server connection with the generated key
      const validationResult = await validateServerConnection({
        serverUrl: formData.server,
        apiKey: `s-${apiKey}`, // Use the prefixed key format
      });
      
      if (!validationResult.success) {
        setValidationError(validationResult);
        setStep('validation-error');
        setIsSubmitting(false);
        return;
      }
      
      // If validation passes, save the key
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: apiKey,
          ...formData
        })
      });
      
      if (response.ok) {
        setStep('success');
      } else {
        const errorData = await response.json();
        console.error('Error creating key:', errorData);
        setValidationError({
          success: false,
          error: `Failed to save key: ${errorData.error}`,
          errorType: 'server_error'
        });
        setStep('validation-error');
      }
    } catch (error) {
      console.error('Error creating key:', error);
      setValidationError({
        success: false,
        error: `Failed to create key: ${error}`,
        errorType: 'network'
      });
      setStep('validation-error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`s-${generatedKey}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    onClose();
    // Reset state after a delay to prevent flickering
    setTimeout(() => {
      setStep('form');
      setFormData({ name: '', email: '', server: '' });
      setGeneratedKey('');
      setCopied(false);
      setValidationError(null);
      setIsSubmitting(false);
    }, 200);
  };

  const handleRetry = () => {
    setStep('form');
    setValidationError(null);
    setIsSubmitting(false);
  };

  if (step === 'form') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="p-6">
        <h2 className="text-2xl font-semibold mb-2">Create new secret key</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="name">
              Name
            </label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="server">
              Server
            </label>
            <Input
              id="server"
              placeholder="https://example.com/mcp"
              value={formData.server}
              onChange={(e) => setFormData({ ...formData, server: e.target.value })}
              required
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`text-white ${
                isFormValid && !isSubmitting
                  ? 'bg-black hover:bg-gray-800' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Validating...' : 'Create secret key'}
            </Button>
          </div>
        </form>
      </Modal>
    );
  }

  if (step === 'validating') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Validating Connection</h2>
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
          <p className="text-sm text-muted-foreground">
            Testing connection to <span className="font-mono">{formData.server}</span>...
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            This may take a few seconds
          </p>
        </div>
      </Modal>
    );
  }

  if (step === 'validation-error') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Connection Failed</h2>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-red-800">
                {validationError?.errorType === 'auth' ? 'Authentication Error' :
                 validationError?.errorType === 'network' ? 'Network Error' :
                 validationError?.errorType === 'timeout' ? 'Connection Timeout' :
                 validationError?.errorType === 'invalid_url' ? 'Invalid URL' :
                 'Server Error'}
              </span>
            </div>
            <p className="text-sm text-red-700">
              {validationError?.error || 'Unknown error occurred'}
            </p>
          </div>

          <div className="text-left mb-6">
            <h3 className="font-medium mb-2">Troubleshooting:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verify the server URL is correct</li>
              <li>• Check your network connection</li>
              <li>• Ensure the server is running and accessible</li>
              <li>• Try again in a few moments</li>
            </ul>
          </div>

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRetry}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Save your key</h2>
      
      <p className="text-sm text-muted-foreground mb-6">
        Please save your secret key in a safe place since <span className="font-semibold">you won&apos;t be able to view it again</span>. 
        Keep it secure, as anyone with your API key can make requests on your behalf. 
        If you do lose it, you&apos;ll need to generate a new one.
      </p>

      <div className="relative mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <code className="text-sm font-mono">s-{generatedKey}</code>
          <Button
            size="sm"
            onClick={handleCopy}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {copied ? (
              <>
                <CheckIcon size={16} />
                Copied
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Permissions</h3>
        <p className="text-sm text-muted-foreground">Read and write API resources</p>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleClose}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          Done
        </Button>
      </div>
    </Modal>
  );
}