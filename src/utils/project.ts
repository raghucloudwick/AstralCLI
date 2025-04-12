import fs from 'fs-extra';
import path from 'path';
import { CliOptions } from '../types/index.js';

/**
 * Find the project root directory by looking for package.json
 */
export async function findProjectRoot(startDir = process.cwd()): Promise<string | null> {
  let currentDir = startDir;
  
  while (currentDir !== path.parse(currentDir).root) {
    const packageJsonPath = path.join(currentDir, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      return currentDir;
    }
    
    currentDir = path.dirname(currentDir);
  }
  
  return null;
}

/**
 * Detect the package manager used in the project
 */
export async function detectPackageManager(projectRoot: string): Promise<CliOptions['packageManager']> {
  const lockFiles = {
    'yarn.lock': 'yarn',
    'package-lock.json': 'npm',
    'pnpm-lock.yaml': 'pnpm'
  } as const;
  
  for (const [lockFile, manager] of Object.entries(lockFiles)) {
    if (await fs.pathExists(path.join(projectRoot, lockFile))) {
      return manager as CliOptions['packageManager'];
    }
  }
  
  return 'npm'; // Default to npm
}

/**
 * Get the default components directory for the project
 */
export async function getDefaultComponentsDir(projectRoot: string): Promise<string> {
  const srcDir = path.join(projectRoot, 'src');
  const srcExists = await fs.pathExists(srcDir);
  
  if (srcExists) {
    // Check for common component directories
    const componentDirs = [
      'components/ui',
      'components',
      'ui',
      'ui/components'
    ];
    
    for (const dir of componentDirs) {
      const fullPath = path.join(srcDir, dir);
      if (await fs.pathExists(fullPath)) {
        return fullPath;
      }
    }
    
    // Default to src/components/ui if no existing directory found
    return path.join(srcDir, 'components/ui');
  }
  
  // Fallback to root/components if no src directory
  return path.join(projectRoot, 'components/ui');
} 