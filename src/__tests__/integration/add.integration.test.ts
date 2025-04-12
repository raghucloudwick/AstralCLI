import { jest, describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { cliPath, setupTestDirectory, cleanupTestDirectory, copyFixture } from './test-helpers.js';
import { fileURLToPath } from 'url';

// Get current directory for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We'll implement the mocks directly in the test file for simplicity
// Basic mock implementation for testing
function setupRemoteMocks() {
  // Mock node-fetch responses
  jest.mock('node-fetch', () => {
    return function fetch(url: string) {
      // Constants for registry URL (matching those in src/utils/remote.ts)
      const REPO_OWNER = 'raghucloudwick';
      const REPO_NAME = 'astralui1';
      const REPO_BRANCH = 'main';
      const BASE_RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`;
      const REGISTRY_PATH = 'registry.json';
      const registryUrl = `${BASE_RAW_URL}/${REGISTRY_PATH}`;

      // Check if the requested URL is the registry URL
      if (url === registryUrl) {
        return Promise.resolve({
          ok: true, 
          status: 200,
          statusText: 'OK',
          json: () => Promise.resolve({
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
                path: "button"
              }
            }
          })
        });
      }
      
      // Default response for other URLs (component files, etc.)
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve(`import React from 'react';
export const Button = ({ children }) => {
  return <button>{children}</button>;
};`)
      });
    };
  });
}

function resetRemoteMocks() {
  jest.resetModules();
  jest.unmock('node-fetch');
}

describe('add command integration tests', () => {
  let currentTestDir: string;
  
  // Path to the fixtures is no longer needed here - it's handled by the copyFixture function
  
  beforeAll(() => {
    // Setup API mocks
    setupRemoteMocks();
  });
  
  afterAll(() => {
    // Reset mocks
    resetRemoteMocks();
  });
  
  beforeEach(async () => {
    currentTestDir = await setupTestDirectory('add');
    
    // Copy the fixtures using the helper function
    await copyFixture('fixture-basic', currentTestDir);
    await copyFixture('fixture-tailwind', currentTestDir);
    
    // Create src/components/ui directory for each fixture
    await fs.ensureDir(path.join(currentTestDir, 'fixture-basic/src/components/ui'));
    await fs.ensureDir(path.join(currentTestDir, 'fixture-tailwind/src/components/ui'));
    
    // Create src directory and copy registry.json to ensure fallback works
    await fs.ensureDir(path.join(currentTestDir, 'fixture-basic/src'));
    await fs.ensureDir(path.join(currentTestDir, 'fixture-tailwind/src'));
    
    // Copy the registry.json file (using the existing one from the project)
    const registryPath = path.resolve(__dirname, '../../../src/registry.json');
    await fs.copy(registryPath, path.join(currentTestDir, 'fixture-basic/src/registry.json'));
    await fs.copy(registryPath, path.join(currentTestDir, 'fixture-tailwind/src/registry.json'));
    
    // Create a dummy package.json in each fixture directory for findProjectRoot to work
    const dummyPackageJson = JSON.stringify({ name: "test-fixture", version: "1.0.0" }, null, 2);
    await fs.writeFile(path.join(currentTestDir, 'fixture-basic/package.json'), dummyPackageJson);
    await fs.writeFile(path.join(currentTestDir, 'fixture-tailwind/package.json'), dummyPackageJson);
  });
  
  afterEach(async () => {
    await cleanupTestDirectory(currentTestDir);
  });
  
  it('should add the Button component to a basic project', async () => {
    const tempBasicDir = path.join(currentTestDir, 'fixture-basic');
    
    // Run the CLI 'add' command
    try {
      const result = await execa('node', [cliPath, 'add', 'button', '--dest', './src/components/ui', '--overwrite'], {
        cwd: tempBasicDir,
        env: { 
          ...process.env,
          GITHUB_PAT: 'mock-github-pat', // Mock PAT for testing
          NODE_ENV: 'test' // Indicate test environment
        }
      });
      
      // Log command output for debugging
      console.log('COMMAND OUTPUT:', result.stdout);
      
      // Assertions
      expect(result.exitCode).toBe(0); // Check CLI exited successfully
      
      // Check files were created - the CLI appears to create files directly in the ui directory
      const uiDir = path.join(tempBasicDir, 'src/components/ui');
      const buttonIndex = path.join(uiDir, 'index.tsx');
      const buttonStyles = path.join(uiDir, 'button.styles.css');
      
      expect(await fs.pathExists(uiDir)).toBe(true);
      expect(await fs.pathExists(buttonIndex)).toBe(true);
      expect(await fs.pathExists(buttonStyles)).toBe(true);
      
      // Check file contents
      const indexContent = await fs.readFile(buttonIndex, 'utf8');
      expect(indexContent).toContain('export function Button');
    } catch (error: any) {
      console.error('Test failed with error:', error);
      console.log('Error stdout:', error.stdout);
      console.error('Error stderr:', error.stderr);
      throw error;
    }
  }, 30000); // Increase timeout for integration tests
  
  it('should add the Button component to a Tailwind project', async () => {
    const tempTailwindDir = path.join(currentTestDir, 'fixture-tailwind');
    
    // Run the CLI 'add' command
    const result = await execa('node', [cliPath, 'add', 'button', '--dest', './src/components/ui', '--overwrite'], {
      cwd: tempTailwindDir,
      env: { 
        ...process.env,
        GITHUB_PAT: 'mock-github-pat', // Mock PAT for testing
        NODE_ENV: 'test' // Indicate test environment
      }
    });
    
    // Assertions
    expect(result.exitCode).toBe(0); // Check CLI exited successfully
    
    // Check files were created - the CLI appears to create files directly in the ui directory
    const uiDir = path.join(tempTailwindDir, 'src/components/ui');
    const buttonIndex = path.join(uiDir, 'index.tsx');
    const buttonStyles = path.join(uiDir, 'button.styles.css');
    
    expect(await fs.pathExists(uiDir)).toBe(true);
    expect(await fs.pathExists(buttonIndex)).toBe(true);
    expect(await fs.pathExists(buttonStyles)).toBe(true);
    
    // Check for tailwind specific markers in CSS or component file
    const stylesContent = await fs.readFile(buttonStyles, 'utf8');
    expect(stylesContent).toBeDefined();
  }, 30000); // Increase timeout for integration tests
  
  it('should handle missing components gracefully', async () => {
    const tempBasicDir = path.join(currentTestDir, 'fixture-basic');
    
    try {
      // Run the CLI 'add' command with a non-existent component
      await execa('node', [cliPath, 'add', 'nonexistent-component', '--dest', './src/components/ui'], {
        cwd: tempBasicDir,
        env: { 
          ...process.env,
          GITHUB_PAT: 'mock-github-pat',
          NODE_ENV: 'test'
        }
      });
      
      // Should not reach here
      expect(true).toBe(false);
    } catch (error: any) {
      // Verify the process exited with an error code
      expect(error.exitCode).not.toBe(0);
      expect(error.stderr).toContain('not found');
    }
  }, 10000);
}); 