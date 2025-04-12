import fetch, { Response } from 'node-fetch';
import fs from 'fs-extra';
import path from 'path';
import { Registry, Component } from '../types/index.js';
import chalk from 'chalk';
import { findProjectRoot } from './project.js';

// GitHub repository configuration
const REPO_OWNER = 'raghucloudwick';
const REPO_NAME = 'astralui1';
const REPO_BRANCH = 'main';

const BASE_RAW_URL = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${REPO_BRANCH}`;
// Set the correct components path based on the repository structure
const COMPONENTS_PATH = 'src/components';
const REGISTRY_PATH = 'registry.json';

// Check if we're in test mode
const isTestMode = process.env.NODE_ENV === 'test';

/**
 * Get GitHub authentication headers if PAT is available
 */
function getAuthHeaders(): Record<string, string> {
  const token = process.env.GITHUB_PAT;
  
  if (!token) {
    if (!isTestMode) {
      console.warn(chalk.yellow('Warning: No GitHub PAT found in GITHUB_PAT environment variable.'));
      console.warn(chalk.yellow('If repository is private, fetching will fail. See README for PAT setup instructions.'));
    }
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/vnd.github.v3.raw'
  };
}

/**
 * Mask a token in a string for safe logging
 */
function maskToken(text: string, token?: string): string {
  if (!token) return text;
  return text.replace(token, '***PAT_REDACTED***');
}

/**
 * Fetch data from GitHub with authentication
 */
async function fetchFromGitHub(url: string): Promise<Response> {
  const headers = getAuthHeaders();
  const token = process.env.GITHUB_PAT;
  
  if (!isTestMode) {
    console.log(chalk.blue(`Fetching URL: ${maskToken(url, token)}`));
    console.log(chalk.dim(`Using authentication: ${Object.keys(headers).length > 0 ? 'Yes' : 'No'}`));
    
    // Log headers with PAT masked
    const maskedHeaders = {...headers};
    if (maskedHeaders['Authorization']) {
      maskedHeaders['Authorization'] = '***PAT_REDACTED***';
    }
    console.log(chalk.dim(`Headers: ${JSON.stringify(maskedHeaders)}`));
  }
  
  try {
    const response = await fetch(url, { headers });
    if (!isTestMode) {
      console.log(chalk.dim(`Response Status: ${response.status} ${response.statusText}`));
    }
    return response;
  } catch (error) {
    if (!isTestMode) {
      console.error(chalk.red(`Fetch Error: ${(error as Error).message}`));
    }
    throw error;
  }
}

/**
 * Fetch the registry from the GitHub repository
 */
export async function fetchRegistry(): Promise<Registry> {
  try {
    if (!isTestMode) {
      console.log(chalk.blue(`Fetching registry from ${REPO_OWNER}/${REPO_NAME}...`));
      const registryUrl = `${BASE_RAW_URL}/${REGISTRY_PATH}`;
      console.log(chalk.dim(`Registry URL: ${registryUrl}`));
    }
    
    const registryUrl = `${BASE_RAW_URL}/${REGISTRY_PATH}`;
    const response = await fetchFromGitHub(registryUrl);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Registry not found at ${registryUrl}`);
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Authentication error accessing ${registryUrl}. Check your GitHub PAT.`);
      } else {
        throw new Error(`Failed to fetch registry: ${response.statusText} (${response.status})`);
      }
    }
    
    const registry = await response.json() as Registry;
    return registry;
  } catch (error) {
    // If remote fetch fails, fall back to local registry
    if (!isTestMode) {
      console.warn(chalk.yellow(`Warning: Could not fetch remote registry: ${(error as Error).message}`));
      console.warn(chalk.yellow('Falling back to local registry.'));
    }
    
    const projectRoot = await findProjectRoot(process.cwd()); // Find project root starting from cwd
    if (!projectRoot) {
      // Log or throw a more specific error if no project root is found
      console.error(chalk.red('✖ Could not find project root to fall back to local registry.'));
      throw new Error('Failed to find project root for local registry fallback.');
    }

    const registryPath = path.join(projectRoot, 'src', 'registry.json');
    if (!isTestMode) { // Add a log for clarity
      console.warn(chalk.yellow(`Attempting local fallback at: ${registryPath}`));
    }
    
    // Read local registry using fs instead of dynamic import
    const localRegistryData = await fs.readFile(registryPath, 'utf-8');
    const localRegistry = JSON.parse(localRegistryData) as Registry;
    return localRegistry;
  }
}

/**
 * Fetch a component source file from the GitHub repository
 */
export async function fetchComponentFile(componentName: string, componentPath: string, filePath: string): Promise<string> {
  if (!isTestMode) {
    console.log(chalk.cyan(`\n--- Debugging Fetch for: ${componentName}/${filePath} ---`));
    
    // Log the component path and file path inputs
    console.log(chalk.dim(`Component name: ${componentName}`));
    console.log(chalk.dim(`Component path: ${componentPath}`));
    console.log(chalk.dim(`File path: ${filePath}`));
    console.log(chalk.dim(`Target Branch: ${REPO_BRANCH}`));
  }
  
  // Check if component path already includes 'src/components'
  let fullPath;
  if (componentPath.startsWith('src/components/')) {
    // If component path already includes the prefix, don't add it again
    fullPath = path.join(componentPath, filePath);
  } else {
    // Otherwise use the configured COMPONENTS_PATH
    fullPath = path.join(COMPONENTS_PATH, componentPath, filePath);
  }
  
  // Ensure we're using forward slashes for GitHub URLs
  const normalizedPath = fullPath.replace(/\\/g, '/');
  
  const url = `${BASE_RAW_URL}/${normalizedPath}`;
  if (!isTestMode) {
    console.log(chalk.green(`Constructed Fetch URL: ${url}`));
  }
  
  try {
    const response = await fetchFromGitHub(url);
    
    if (!isTestMode) {
      console.log(chalk.dim(`Fetch Response Status: ${response.status} ${response.statusText}`));
    }
    
    if (!response.ok) {
      if (response.status === 404) {
        if (!isTestMode) {
          console.error(chalk.red(`File not found: ${normalizedPath} (HTTP 404)`));
          
          // Diagnostic help - suggest possible URLs for manual checking
          const possiblePaths = [
            `${BASE_RAW_URL}/${componentPath}/${filePath}`,
            `${BASE_RAW_URL}/src/${componentPath}/${filePath}`,
            `${BASE_RAW_URL}/src/components/${componentPath.replace('src/components/', '')}/${filePath}`,
            `${BASE_RAW_URL}/src/components/${componentName.toLowerCase()}/${filePath}`,
            `${BASE_RAW_URL}/components/${componentPath.replace('src/components/', '')}/${filePath}`
          ];
          
          console.log(chalk.yellow('Possible alternative paths to check manually:'));
          possiblePaths.forEach(path => console.log(chalk.yellow(`  ${path}`)));
        }
        
        throw new Error(`File not found: ${normalizedPath} (HTTP 404)`);
      } else if (response.status === 401 || response.status === 403) {
        if (!isTestMode) {
          console.error(chalk.red(`Authentication error accessing ${url}. Check your GitHub PAT.`));
        }
        throw new Error(`Authentication error accessing ${url}. Check your GitHub PAT.`);
      } else {
        if (!isTestMode) {
          console.error(chalk.red(`Failed to fetch ${filePath}: ${response.statusText} (${response.status})`));
        }
        throw new Error(`Failed to fetch ${filePath}: ${response.statusText} (${response.status})`);
      }
    }
    
    if (!isTestMode) {
      console.log(chalk.green(`✓ Successfully fetched ${filePath}`));
    }
    return await response.text();
  } catch (error) {
    if (!isTestMode) {
      console.error(chalk.red(`Error during fetch: ${(error as Error).message}`));
    }
    throw error;
  }
}

/**
 * Fetch all source files for a component and write them to the target directory
 */
export async function fetchComponentSourceFiles(component: Component, targetDir: string): Promise<void> {
  if (!isTestMode) {
    console.log(chalk.blue(`\n==== Fetching ${component.name} component files ====`));
    console.log(chalk.dim(`Component info: ${JSON.stringify(component, null, 2)}`));
    
    // Get the component's base path - this should match the repository structure
    // Use a default path based on the component name if no path is provided in the registry
    const componentBasePath = component.path || component.name.toLowerCase();
    console.log(chalk.dim(`Using component base path: ${componentBasePath}`));
  }
  
  // Get the component's base path
  const componentBasePath = component.path || component.name.toLowerCase();
  
  // Get component directory name for target path construction
  const componentDirName = component.name.toLowerCase();
  
  for (const file of component.files) {
    try {
      if (!isTestMode) {
        console.log(chalk.cyan(`\nProcessing file: ${file}`));
        
        // Extract filename from the file path 
        const fileName = path.basename(file);
        console.log(chalk.dim(`File name: ${fileName}`));
      }
      
      // Extract filename from the file path 
      const fileName = path.basename(file);
      
      // Fetch the file content using the component base path and current filename
      const content = await fetchComponentFile(component.name, componentBasePath, fileName);
      
      // Construct target path including the component directory
      const targetFilePath = path.join(targetDir, componentDirName, fileName);
      
      // Ensure target directory exists
      await fs.ensureDir(path.dirname(targetFilePath));
      
      // Write the file
      await fs.writeFile(targetFilePath, content);
      
      if (!isTestMode) {
        console.log(chalk.green(`✓ Created ${path.relative(process.cwd(), targetFilePath)}`));
        console.log(chalk.dim(`Content preview: ${content.substring(0, 100)}...`));
      }
    } catch (error) {
      if (!isTestMode) {
        console.error(chalk.red(`Failed to fetch or write file '${file}': ${(error as Error).message}`));
      }
      throw error;
    }
  }
  
  if (!isTestMode) {
    console.log(chalk.green(`\n✓ All files for ${component.name} fetched successfully`));
  }
} 