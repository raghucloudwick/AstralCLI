// Mock the node-fetch module for testing
import { jest } from '@jest/globals';

// Mock response for the registry
const mockRegistryResponse = {
  components: {
    button: {
      name: "Button",
      description: "Primary button component for user interactions.",
      files: [
        "index.tsx",
        "button.styles.css",
        "README.md"
      ],
      dependencies: ["clsx", "react-merge-refs", "@floating-ui/react"],
      path: "src/components/button"
    }
  }
};

// Mock component files content
const mockFiles = {
  "index.tsx": `import React from 'react';
import './button.styles.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button = ({ children, variant = 'primary', size = 'md' }: ButtonProps) => {
  return (
    <button className={\`button button-\${variant} button-\${size}\`}>
      {children}
    </button>
  );
};`,

  "button.styles.css": `.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: 500;
}

.button-primary {
  background-color: #3b82f6;
  color: white;
}

.button-secondary {
  background-color: #f3f4f6;
  color: #1f2937;
}`,

  "README.md": `# Button Component

A versatile button component that supports various styles and sizes.

## Usage

\`\`\`jsx
import { Button } from './components/button';

function App() {
  return (
    <Button variant="primary" size="md">
      Click me
    </Button>
  );
}
\`\`\`

## Props

- \`variant\`: 'primary' | 'secondary' | 'outline' | 'ghost'
- \`size\`: 'sm' | 'md' | 'lg'
- \`children\`: React.ReactNode
`
};

// Mock setup function
export function setupRemoteMocks() {
  // Mock the node-fetch module
  jest.mock('node-fetch', () => {
    return function fetch(url: string) {
      // Registry mock
      if (url.includes('registry.json')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          json: () => Promise.resolve(mockRegistryResponse)
        });
      }
      
      // Component file mocks
      if (url.includes('index.tsx')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: () => Promise.resolve(mockFiles["index.tsx"])
        });
      }
      
      if (url.includes('button.styles.css')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: () => Promise.resolve(mockFiles["button.styles.css"])
        });
      }
      
      if (url.includes('README.md')) {
        return Promise.resolve({
          status: 200,
          ok: true,
          text: () => Promise.resolve(mockFiles["README.md"])
        });
      }
      
      // Default 404 response
      return Promise.resolve({
        status: 404,
        ok: false,
        text: () => Promise.resolve('Not Found')
      });
    };
  });
}

// Reset mocks
export function resetRemoteMocks() {
  jest.resetModules();
  jest.unmock('node-fetch');
} 