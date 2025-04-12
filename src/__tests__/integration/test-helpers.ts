import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs-extra';

// Get the current filename and directory for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the compiled CLI
export const cliPath = path.resolve(__dirname, '../../../dist/index.js');

export async function setupTestDirectory(baseName = 'test'): Promise<string> {
  const baseTempDir = path.join(os.tmpdir(), `astral-cli-${baseName}-${Date.now()}`);
  const testDir = path.join(baseTempDir, `run-${Math.random().toString(36).substring(7)}`);
  await fs.ensureDir(testDir);
  return testDir; // Return the specific test run directory
}

export async function cleanupTestDirectory(testDir: string): Promise<void> {
  if (testDir && await fs.pathExists(testDir)) {
     // Go up one level to the base temp dir created by setupTestDirectory to clean everything
     const baseTempDir = path.dirname(testDir);
     await fs.remove(baseTempDir);
  }
}

export async function copyFixture(fixtureName: string, targetDir: string): Promise<void> {
  // Assuming test-helpers.ts is in src/__tests__/integration/
  const fixtureSourceDir = path.resolve(__dirname, 'fixtures', fixtureName);
  const targetFixtureDir = path.join(targetDir, fixtureName);
  await fs.copy(fixtureSourceDir, targetFixtureDir);
} 