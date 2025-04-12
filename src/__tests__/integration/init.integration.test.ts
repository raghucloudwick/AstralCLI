import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { cliPath, setupTestDirectory, cleanupTestDirectory } from './test-helpers.js';

describe('init command integration tests', () => {
  let currentTestDir: string;

  beforeEach(async () => {
    currentTestDir = await setupTestDirectory('init');
  });

  afterEach(async () => {
    await cleanupTestDirectory(currentTestDir);
  });

  it('should create a local .env file with token', async () => {
    const mockToken = 'test-local-pat-12345';

    // Run the CLI 'init' command with a token in the temp directory
    const result = await execa('node', [cliPath, 'init', '--token', mockToken], {
      cwd: currentTestDir, // Run command inside the temp directory
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // --- Assertions ---
    expect(result.exitCode).toBe(0); // Check CLI exited successfully

    // Check if .env file was created
    const envPath = path.join(currentTestDir, '.env');
    expect(await fs.pathExists(envPath)).toBe(true);

    // Check file content
    const envContent = await fs.readFile(envPath, 'utf8');
    expect(envContent).toContain(`GITHUB_PAT=${mockToken}`);

  }, 15000); // Timeout

  it('should create a local .env file without token (placeholder)', async () => {
    // Run the CLI 'init' command without a token in the temp directory
    const result = await execa('node', [cliPath, 'init'], {
      cwd: currentTestDir,
      env: { ...process.env, NODE_ENV: 'test' }
    });

    // --- Assertions ---
    expect(result.exitCode).toBe(0);

    const envPath = path.join(currentTestDir, '.env');
    expect(await fs.pathExists(envPath)).toBe(true);

    const envContent = await fs.readFile(envPath, 'utf8');
    expect(envContent).toContain('GITHUB_PAT=your_token_here');

  }, 15000);

  // Add test for 'init --global' if needed (more complex due to mocking home dir)
}); 