'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckIcon } from '@/components/icons';

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
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    server: ''
  });
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Check if all required fields are filled
  const isFormValid = formData.name.trim() !== '' && formData.email.trim() !== '' && formData.server.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.email || !formData.server) {
      alert('Please fill in all required fields: Name, Email, and Server');
      return;
    }
    
    // Generate the API key
    const apiKey = generateApiKey();
    setGeneratedKey(apiKey);
    
    // Call backend API to save the key
    try {
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
        alert('Failed to create key: ' + errorData.error);
      }
    } catch (error) {
      console.error('Error creating key:', error);
      alert('Failed to create key: ' + error);
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
    }, 200);
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
              disabled={!isFormValid}
              className={`text-white ${
                isFormValid 
                  ? 'bg-black hover:bg-gray-800' 
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Create secret key
            </Button>
          </div>
        </form>
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