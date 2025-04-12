import { describe, it, expect } from '@jest/globals';
import { execa } from 'execa';
import path from 'path';
import { fileURLToPath } from 'url';
import { cliPath } from './test-helpers.js';

// Get current directory for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('list command integration tests', () => {
  it('should list available components successfully', async () => {
    // Run the CLI 'list' command
    // We run it in the project root context for simplicity for 'list'
    const result = await execa('node', [cliPath, 'list'], {
      cwd: path.resolve(__dirname, '../../../'), // Execute from project root
      env: {
        ...process.env,
        NODE_ENV: 'test' // Indicate test environment
      }
    });

    // --- Assertions ---
    // Check CLI exited successfully
    expect(result.exitCode).toBe(0);

    // Check that the output contains known component names
    // (Based on your registry.json)
    expect(result.stdout).toContain('Button');
    expect(result.stdout).toContain('Accordion');
    expect(result.stdout).toContain('Avatar');
    // Add more checks if desired

  }, 15000); // Timeout for safety
}); 