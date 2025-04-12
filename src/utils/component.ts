import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import { Component, CliOptions, ComponentContext, Registry } from '../types/index.js';
import { fetchRegistry, fetchComponentSourceFiles } from './remote.js';
import chalk from 'chalk';

// Cache for the registry
let registryCache: Registry | null = null;

/**
 * Get the component registry, fetching from remote if needed
 */
export async function getRegistry(): Promise<Registry> {
  if (!registryCache) {
    registryCache = await fetchRegistry();
  }
  return registryCache;
}

/**
 * Get component information from registry
 */
export async function getComponent(componentName: string): Promise<Component | null> {
  const registry = await getRegistry();
  // Case-insensitive lookup
  const lowerName = componentName.toLowerCase();
  
  // Try direct lookup first
  if (registry.components[lowerName]) {
    return registry.components[lowerName];
  }
  
  // If not found, try case-insensitive search
  for (const [key, component] of Object.entries(registry.components)) {
    if (key.toLowerCase() === lowerName || 
        component.name.toLowerCase() === lowerName) {
      return component;
    }
  }
  
  return null;
}

/**
 * List all available components
 */
export async function listComponents(): Promise<Component[]> {
  const registry = await getRegistry();
  return Object.values(registry.components);
}

/**
 * Check if component file already exists in the target directory
 */
export async function checkComponentFilesExist(component: Component, targetDir: string): Promise<boolean> {
  for (const file of component.files) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      return true;
    }
  }
  return false;
}

/**
 * Fetch component source files from repository and save to target directory
 */
export async function fetchComponentSource(component: Component, targetDir: string, overwrite = false): Promise<void> {
  try {
    await fetchComponentSourceFiles(component, targetDir);
  } catch (error) {
    console.warn(chalk.yellow(`Warning: Failed to fetch component source from remote: ${(error as Error).message}`));
    console.warn(chalk.yellow('Falling back to generating placeholder files...'));
    
    // Fallback to generating placeholder files
    for (const file of component.files) {
      const targetPath = path.join(targetDir, file);
      const targetDirectory = path.dirname(targetPath);
      
      // Ensure directory exists
      await fs.ensureDir(targetDirectory);
      
      // Check if file exists and should be skipped
      const fileExists = await fs.pathExists(targetPath);
      if (fileExists && !overwrite) {
        console.log(chalk.yellow(`Skipping existing file: ${path.relative(process.cwd(), targetPath)}`));
        continue;
      }
      
      // Create placeholder content
      let content = '';
      if (file.endsWith('.tsx')) {
        content = generateComponentTsx(component);
      } else if (file.endsWith('.css') || file.endsWith('.scss')) {
        content = generateComponentCss(component);
      }
      
      // Write file
      await fs.writeFile(targetPath, content, 'utf-8');
      console.log(chalk.green(`✓ Created ${path.relative(process.cwd(), targetPath)}`));
    }
  }
}

/**
 * Install component dependencies
 */
export async function installDependencies(
  context: ComponentContext
): Promise<void> {
  const { component, options } = context;
  
  if (!component.dependencies.length) {
    return;
  }
  
  const packageManager = options.packageManager || 'npm';
  const installCommand = {
    npm: 'install',
    yarn: 'add',
    pnpm: 'add'
  }[packageManager];
  
  try {
    await execa(packageManager, [installCommand, ...component.dependencies], {
      stdio: 'inherit'
    });
  } catch (error) {
    throw new Error(`Failed to install dependencies: ${(error as Error).message}`);
  }
}

/**
 * Generate placeholder TSX content
 */
function generateComponentTsx(component: Component): string {
  return `import React from 'react';
import './${component.name.toLowerCase()}.styles.css';

export interface ${component.name}Props {
  children?: React.ReactNode;
  className?: string;
}

export function ${component.name}({ children, className = '' }: ${component.name}Props) {
  return (
    <div className={\`astral-${component.name.toLowerCase()} \${className}\`}>
      {children}
    </div>
  );
}

${component.name}.displayName = '${component.name}';
`;
}

/**
 * Generate placeholder CSS content
 */
function generateComponentCss(component: Component): string {
  return `.astral-${component.name.toLowerCase()} {
  /* Component styles would go here */
  display: block;
  position: relative;
}
`;
} 